// Import the Mongoose library
const mongoose = require("mongoose");
// Import the bcrypt library for password hashing
const bcrypt = require("bcrypt");

// Define the schema for the user model
const userSchema = mongoose.Schema(
  {
    // Field to store the name of the user
    name: { type: String, required: true },

    // Field to store the email of the user
    email: { type: String, required: true, unique: true },

    // Field to store the password of the user
    password: { type: String },

    // Field to store the profile picture URL of the user
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg", // Default profile picture URL
    },
  },
  {
    // Automatically add createdAt and updatedAt fields to the document
    timestamps: true,
  }
);

// Define a method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    // If there is no password (e.g., Google login), return true
    return true;
  }
  // Use bcrypt.compare to compare entered password with hashed password
  return await bcrypt.compare(enteredPassword, this.password);
};

// Define a pre-save hook for the user schema
userSchema.pre("save", async function (next) {
  // Check if the document has been modified
  if (!this.isModified("password")) {
    // If the document hasn't been modified, proceed with the save operation
    next();
  }

  if (this.password) {
    // Generate a salt for password hashing
    const salt = await bcrypt.genSalt(10);

    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Call next() to continue with the save operation
  next();
});

// Create the User model based on the user schema
const User = mongoose.model("User", userSchema);

// Export the User model to make it accessible in other files
module.exports = User;
