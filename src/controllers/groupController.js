const groupModel = require('../models/groupModel');
const validator = require('validator');
const { queueInviteEmailSending } = require('../services/emailQueueProducer');
const logger = require('../../logger');

// TODO: implement the stage of create group(add group member via invite)
module.exports.createGroup = async (req, res) => {
  const { stage, groupData } = req.body;
  try {
    // Stage 1: Group name and group description(optional)
    if (stage == 1) {
      // Extract the nested group details from groupData
      const { groupName, description } = groupData;
      if (!groupName || !validator.isLength(groupName.trim(), { min: 1 })) {
        // description is optional
        return res.status(400).json({ message: 'Group name is required.' });
      }

      // Sanitize the input before saving
      const sanitizedGroupName = validator.escape(groupName.trim());
      const sanitizedGroupDescription = description ? validator.escape(description.trim()) : ' ';
      // Create the group (no members yet)
      const newgroup = await groupModel.create({
        groupName: sanitizedGroupName,
        description: sanitizedGroupDescription,
        createdBy: req.user.id,
      });

      // save the groupInfo to DB(without group members)
      await newgroup.save();
      return res.status(200).json({
        message: 'Group created successfully. Proceed to add members.',
        groupId: newgroup._id,
        nextStage: 2,
      });
    }

    // Stage 2: Add member and send invites
    if (stage == 2) {
      const { groupId } = groupData;
      const { members } = req.body;
      if (!groupId || !members || members.length === 0) {
        return res.status(400).json({
          message: "Group ID and member's email required",
        });
      }
      const groupById = await groupModel.findById({ groupId });
      if (!groupById) {
        return res.status(404).json({ message: 'Group not found.' });
      }

      // Send emails to all the members mentioned
      // make sure the member.length <=25
      if (members.length > 25) {
        return res.status(400).json({
          message: 'Members length exceeds 25',
        });
      }
      // Verify each email if it is valid or not then add to redis queue
      for (const member of members) {
        if (!validator.isEmail(member)) {
          return res.status(400).json({ message: `Invalid email: ${member}` });
        }

        // construct a mail option to send as invite
        const mailOptions = {
          from: `"SplitBhai Team" <backend.team@splitbhai.com>`,
          to: member,
          subject: `You're Invited to join the ${groupById.groupName} by your friends on SplitBhai`,
          text: `Hello, \n\nYou have been invited to join the group "${groupById.groupName}". Use this invite code to join: ${groupById._id}.`,
        };

        try {
          await queueInviteEmailSending(mailOptions);
        } catch (error) {
          logger.error(`Error adding emails to invite queue: ${error.message}`);
          return res.status(500).json({ message: 'Error processing invites. Please try again.' });
        }
      }

      return res.status(200).json({ message: 'Invite emails sent successfully.' });
    }
  } catch (error) {
    logger.error('Error in createGroup controller:', error.message);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// TODO: add option to check if user is signed in or not (redirect to register/login if nots)
module.exports.joinGroup = async (req, res) => {
  const { groupName, groupCode } = req.body;

  try {
    // Validate input data
    if (!groupCode || !groupName) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }
    // Find group by name and code
    const group = await groupModel.findOne({
      groupName: groupName.trim(),
      _id: groupCode,
    });

    if (!group) {
      return res.status(404).json({ message: 'Group code or group name is invalid' });
    }

    // Check if user is already part of the group
    const isMember = group.members.some((member) => member.user.equals(req.user.id));

    if (isMember) {
      return res.status(400).json({ message: 'You are already a part of this group' });
    }

    // Add the user to the group
    group.members.push({ user: req.user.id, role: 'member' });
    await group.save();

    // Return a success message
    return res.status(200).json({
      message: 'You have successfully joined the group',
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'An error occurred while joining the group' });
  }
};
