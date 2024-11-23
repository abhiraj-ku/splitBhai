const groupModel = require('../models/groupModel');
const validator = require('validator');
const redisClient = require('../services/redisServer');
const { queueInviteEmailSending } = require('../services/emailQueueProducer');
const logger = require('../../logger');
const inviteCodeTemplate = require('./helpers/inviteCodeTemplate');

const { generateInviteCode, validateEmail } = require('./helpers/groupHelpers');

// redis client configs
async function sendInviteViaRedis(groupById, normalizedEmail, inviteCode) {
  const inviteKey = `${groupById.groupName}:invite:${inviteCode}`;
  const redisInviteCodeSet = JSON.stringify({
    groupId: groupById._id,
    email: normalizedEmail,
    groupName: groupById.groupName,
  });

  await redisClient.set(inviteKey, redisInviteCodeSet, 'EX', 2 * 24 * 60 * 60, (err) => {
    if (err) {
      console.error('Error setting invite code in redis');
      throw new Error(err);
    } else {
      console.log(`Invite data successfully saved in Redis under key ${inviteKey}`);
    }
  });
}

module.exports.createGroup = async (req, res) => {
  const { stage, groupData, members } = req.body;
  try {
    // Stage 1: Group name and group description(optional)
    if (stage == 1) {
      // Extract the nested group details from groupData
      const { groupName, description } = groupData;
      if (!groupName) {
        // description is optional
        return res.status(400).json({ message: 'Group name is required.' });
      } else if (!validator.isLength(description.trim(), { min: 1, max: 100 })) {
        return res
          .status(400)
          .json({ message: 'Description must be between 1 to 100 characters.' });
      }

      // Sanitize the input before saving
      const sanitizedGroupName = validator.escape(groupName.trim());
      const sanitizedGroupDescription = description ? validator.escape(description.trim()) : ' ';

      // Create the group (no members yet)
      const newgroup = await groupModel.create({
        groupName: sanitizedGroupName,
        description: sanitizedGroupDescription,
        createdBy: req.user.id,
        members: [
          {
            user: req.user.id,
            role: 'admin',
            status: 'active',
            email: req.user.email,
            inviteCode: generateInviteCode(),
            joinedAt: new Date(),
          },
        ],
      });

      // save the groupInfo to DB(without group members)
      await newgroup.save();
      return res.status(200).json({
        message: 'Group created successfully.',
        groupId: newgroup._id,
        nextStage: 2,
      });
    }

    // Stage 2: Add member and send invites
    if (stage == 2) {
      const { groupId } = groupData;

      // validate the group id
      const groupById = await groupModel.findById({ groupId });
      if (!groupById) {
        return res.status(404).json({ message: 'Group not found.' });
      }

      // Validate members array
      if (!Array.isArray(members) || members.length === 0) {
        return res.status(400).json({
          message: 'Please provide at least one member email',
        });
      }

      // Send emails to all the members mentioned
      // make sure the member.length <=25
      if (members.length > groupById.settings.maxMembers - groupById.members.length) {
        return res.status(400).json({
          message: `Cannot add more than ${groupById.settings.maxMembers} members to a group`,
        });
      }

      const newMembers = [];
      const emailPromises = [];
      // Verify each email if it is valid or not then add to redis queue
      for (const email of members) {
        const normalizedEmail = validateEmail(email);
        if (!normalizedEmail) {
          return res.status(400).json({ message: `Invalid email: ${email}` });
        }

        // check email is already present
        if (groupById.members.some((member) => member.email === normalizedEmail)) {
          {
            return res.status(400).jsoN({ message: `${email} already in the group` });
          }
        }

        const inviteCode = generateInviteCode();
        sendInviteViaRedis(groupById, normalizedEmail, inviteCode);

        newMembers.push({
          email: normalizedEmail,
          status: 'pending',
          role: 'member',
          inviteCode,
          invitedAt: new Date(),
        });

        const inviteLink = `${process.env.FRONTEND_URL}/groups/join?code=${inviteCode}&group=${groupById.groupName}`;

        // construct a mail option to send as invite
        const mailOptions = {
          from: `"SplitBhai Team" <backend.team@splitbhai.com>`,
          to: normalizedEmail,
          subject: `You're Invited to join the ${groupById.groupName} by your friend ${req.user.name} on SplitBhai`,
          text: inviteCodeTemplate({
            groupName: groupById.groupName,
            inviterName: req.user.name,
            inviteLink,
            inviteCode,
          }),
        };

        try {
          await queueInviteEmailSending(mailOptions);
          groupById.members.push(...newMembers);
          await groupById.save();

          return res
            .status(200)
            .json({ message: 'Members invited successfully', data: { groupId: groupById._id } });
        } catch (error) {
          logger.error('Error while inviting members');
          return res.status(400).json({ message: 'Invalid stage' });
        }
      }

      return res.status(200).json({ message: 'Invite emails sent successfully.' });
    }
  } catch (error) {
    logger.error('Error in createGroup controller:', error.message);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports.joinGroup = async (req, res) => {
  // const { groupName, inviteCode } = req.body;
  const { group: groupName, code: inviteCode } = req.query;

  try {
    // Validate input data
    if (!groupName || !inviteCode) {
      return res.status(400).json({
        message: 'Group name and invite code are required',
      });
    }

    // construct redis inviteKey
    const inviteKey = `${groupName.trim()}:invite${inviteCode}`;
    const redisJoinInviteData = await new Promise((resolve, reject) => {
      redisClient.get(inviteKey, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    if (!redisJoinInviteData) {
      return res.status(400).json({ message: 'Invalid or exired invite code' });
    }

    const inviteData = JSON.parse(redisJoinInviteData);

    // Find group by name and code
    const group = await groupModel.findById(inviteData.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Invalid group name or invite code' });
    }

    // find pending invite code
    const memberIndex = group.members.findIndex(
      (mem) => mem.inviteCode === inviteCode && mem.status === 'pending'
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Invite code is not valid or already used ' });
    }

    // Check if user is already part of the group
    const isMember = group.members.some((member) => member.user.equals(req.user.id));

    if (isMember) {
      return res.status(400).json({ message: 'You are already a part of this group' });
    }

    // Update the users details and save to dattabase
    group.members[memberIndex].user = req.user._id;
    group.members[memberIndex].status = 'active';
    group.members[memberIndex].joinedAt = new Date();

    await group.save();

    // remove the invite key from redis
    await new Promise((resolve, reject) => {
      redisClient.del(inviteKey, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Return a success message
    return res.status(200).json({
      message: 'You have successfully joined the group',
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'An error occurred while joining the group' });
  }
};
