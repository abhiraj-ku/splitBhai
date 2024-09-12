const groupModel = require("../models/groupModel");

// TODO: implement the create group func wrt to frontend design
module.exports.createGroup = async (req, res) => {};

// TODO: implement the join group func wrt to frontend design
module.exports.joinGroup = async (req, res) => {
  const { groupName, groupCode } = req.body;

  try {
    // Validate input data
    if (!groupCode || !groupName) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }
    // Find group by name and code
    const group = await groupModel.findOne({
      $where: {
        groupName: groupName,
        groupCode: groupCode,
      },
    });

    if (!group) {
      return res
        .status(404)
        .json({ message: "Group code or group name is invalid" });
    }

    // Check if user is already part of the group
    const isMember = group.members.some((member) =>
      member.user.equals(req.user.id)
    );

    if (isMember) {
      return res
        .status(400)
        .json({ message: "You are already a part of this group" });
    }

    // Add the user to the group
    group.members.push({ user: req.user.id });
    await group.save();

    // Return a success message
    return res.status(200).json({
      message: "You have successfully joined the group",
    });
    return;
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while joining the group" });
  }
};
