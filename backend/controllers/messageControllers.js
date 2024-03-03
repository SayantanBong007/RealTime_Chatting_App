const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

/*******************************************************/
/* SEND MESSAGE ENDPOINT */
/*******************************************************/
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  // Check if content and chatId are provided in the request body
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  // Create a new message object
  var newMessage = {
    sender: req.user._id, // Set the sender of the message to the current user
    content: content,
    chat: chatId,
  };

  try {
    // Create a new message document in the database
    var message = await Message.create(newMessage);

    // Populate the sender field of the message with name and pic
    message = await message.populate("sender", "name pic");

    // Populate the chat field of the message
    message = await message.populate("chat");

    // Populate the chat.users field of the message with name, pic, and email
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update the latestMessage field of the chat associated with the message
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    // Send the populated message object as a response
    res.json(message);
  } catch (err) {
    res.status(400); // Set response status to 400 (Bad Request)
    throw new Error(err.message); // Throw an error with the message received
  }
});

/*******************************************************/
/* GET ALL MESSAGES ENDPOINT */
/*******************************************************/
const allMessages = asyncHandler(async (req, res) => {
  try {
    // Find all messages associated with the specified chatId
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email") // Populate sender field with name, pic, and email
      .populate("chat"); // Populate chat field

    // Send the populated messages array as a response
    res.json(messages);
  } catch (error) {
    res.status(400); // Set response status to 400 (Bad Request)
    throw new Error(error.message); // Throw an error with the message received
  }
});

module.exports = { sendMessage, allMessages };
/*******************************************************/
