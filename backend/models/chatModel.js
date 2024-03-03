// Import the Mongoose library
const mongoose = require("mongoose");

// Destructure the Schema object from mongoose
const { Schema } = mongoose;

// Define the schema for the chat model
const chatSchema = new Schema(
  {
    // Name of the chat
    chatName: { type: String, trim: true },

    // Indicates if it's a group chat, default value is false
    isGroupChat: { type: Boolean, default: false },

    // Array of ObjectId references to users participating in the chat
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
      },
    ],

    // ObjectId reference to the latest message in the chat
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Reference to the Message model
    },

    // ObjectId reference to the group admin
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
  },
  {
    // Automatically add createdAt and updatedAt fields to the document
    timestamps: true,
  }
);

// Create and export the chat model based on the schema
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
