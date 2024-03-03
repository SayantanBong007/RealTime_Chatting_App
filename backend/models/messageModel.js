// Import the Mongoose library
const mongoose = require("mongoose");

// Define the schema for the message model
const messageSchema = mongoose.Schema(
  {
    // Field to store the ObjectId of the user who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References documents in the "User" collection
    },
    // Field to store the content of the message
    content: {
      type: String,
      trim: true, // Trims any whitespace at the beginning and end of the string
    },
    // Field to store the ObjectId of the chat to which the message belongs
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat", // References documents in the "Chat" collection
    },
  },
  {
    // Automatically add createdAt and updatedAt fields to the document
    timestamps: true,
  }
);

// Create the Message model based on the message schema
const Message = mongoose.model("Message", messageSchema);

// Export the Message model to make it accessible in other files
module.exports = Message;
