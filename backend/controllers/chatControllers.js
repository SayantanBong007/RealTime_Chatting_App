/***************************************************************
 * Define middleware to handle asynchronous route handlers
 ***************************************************************/
const asyncHandler = require("express-async-handler");

/***************************************************************
 * Import required models and modules
 ***************************************************************/
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

/***************************************************************
 * Access a one-to-one chat or create if not exists
 ***************************************************************/
const accessChat = asyncHandler(async (req, res) => {
  // Extract userId from request body
  const { userId } = req.body;

  // Check if userId is provided
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  // Find if a one-to-one chat exists between current user and specified user
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } }, // Check if current user is in users array
      { user: { $elemMatch: { $eq: userId } } }, // Check if specified user is in user array
    ],
  })
    .populate("users", "-password") // Populate users field excluding password
    .populate("latestMessage"); // Populate latestMessage field

  // Populate sender details of latest message
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // If one-to-one chat exists, send the chat details
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // If one-to-one chat does not exist, create a new one
    const chatData = {
      chatName: "sender", // Temporary chat name
      isGroupChat: false,
      users: [req.user._id, userId], // Array of user IDs
    };

    // Create the one-to-one chat
    try {
      const createChat = await Chat.create(chatData);

      // Retrieve the full chat details
      const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
      );

      // Send the full chat details
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

/***************************************************************
 * Fetch all chats for the current user
 ***************************************************************/
const fetchChats = asyncHandler(async (req, res) => {
  try {
    // Find all chats where current user is present
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password") // Populate users field excluding password
      .populate("groupAdmin", "-password") // Populate groupAdmin field excluding password
      .populate("latestMessage") // Populate latestMessage field
      .sort({ updatedAt: -1 }) // Sort chats by updatedAt field in descending order
      .then(async (results) => {
        // Populate sender details of latest message for each chat
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/***************************************************************
 * Create a new group chat
 ***************************************************************/
const createGroupChat = asyncHandler(async (req, res) => {
  // Check if required fields are provided
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  // Parse users array from JSON string
  var users = JSON.parse(req.body.users);

  // Check if there are at least 2 users in the group chat
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  // Add current user to the group
  users.push(req.user);

  try {
    // Create the group chat
    const groupChat = await Chat.create({
      chatName: req.body.name, // Group chat name
      users: users, // Array of user IDs
      isGroupChat: true,
      groupAdmin: req.user, // Group admin user ID
    });

    // Retrieve the full group chat details
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate(
      "users",
      "-password"
    );

    // Send the full group chat details
    res.status(200).json(fullGroupChat);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

/***************************************************************
 * Rename a group chat
 ***************************************************************/
const renameGroup = asyncHandler(async (req, res) => {
  // Extract chatId and chatName from request body
  const { chatId, chatName } = req.body;

  // Find and update the chat name
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName }, // Update chatName field
    { new: true } // Return updated document
  )
    .populate("users", "-password") // Populate users field excluding password
    .populate("groupAdmin", "-password"); // Populate groupAdmin field excluding password

  // If chat is not found, send 404 error
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Send the updated chat details
    res.json(updatedChat);
  }
});

/***************************************************************
 * Add a user to a group chat
 ***************************************************************/
const addToGroup = asyncHandler(async (req, res) => {
  // Extract chatId and userId from request body
  const { chatId, userId } = req.body;

  // Add the specified user to the group chat
  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } }, // Add userId to users array
    { new: true } // Return updated document
  )
    .populate("users", "-password") // Populate users field excluding password
    .populate("groupAdmin", "-password"); // Populate groupAdmin field excluding password

  // If chat is not found, send 404 error
  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Send the updated chat details
    res.json(added);
  }
});

/***************************************************************
 * Remove a user from a group chat
 ***************************************************************/
const removeFromGroup = asyncHandler(async (req, res) => {
  // Extract chatId and userId from request body
  const { chatId, userId } = req.body;

  // Remove the specified user from the group chat
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } }, // Remove userId from users array
    { new: true } // Return updated document
  )
    .populate("users", "-password") // Populate users field excluding password
    .populate("groupAdmin", "-password"); // Populate groupAdmin field excluding
  // If chat is not found, send 404 error
  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Send the updated chat details
    res.json(removed);
  }
});

/***************************************************************
 * Export all controller functions for use in routes
 ***************************************************************/
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
