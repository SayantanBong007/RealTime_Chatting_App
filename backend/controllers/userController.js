/********************************************************************************************************* */
// Import the 'express-async-handler' middleware to handle asynchronous functions in Express route handlers
const asyncHandler = require("express-async-handler");

// Import the 'User' model from the '../models/userModel' file, representing the structure of user data in the database
const User = require("../models/userModel");

// Import the 'generateToken' function from the '../config/generateToken' file, responsible for generating JWTs for user authentication
const generateToken = require("../config/generateToken");

/************************************************************************************************************ */
// Define a route handler for user registration
const registerUser = asyncHandler(async (req, res) => {
  // Extract user data from the request body
  const { name, email, password, pic } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password) {
    res.status(400); // Set response status code to 400 (Bad Request)
    throw new Error("Please Enter all the Fields"); // Throw an error indicating missing fields
  }

  // Check if the user already exists in the database
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400); // Set response status code to 400 (Bad Request)
    throw new Error("User already exists"); // Throw an error indicating user already exists
  }

  // Create a new user in the database with provided data
  const user = await User.create({ name, email, password, pic });

  // If user creation is successful, send a response with user details and a JWT token for authentication
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id), // Generate JWT token for user authentication
    });
  } else {
    res.status(404); // Set response status code to 404 (Not Found)
    throw new Error("Failed to create the user"); // Throw an error indicating user creation failed
  }
});

/*********************************************************************************************** */
// Define a route handler for user authentication
const authUser = asyncHandler(async (req, res) => {
  // Extract user credentials from the request body
  const { email, password } = req.body;

  // Find the user in the database by email
  const user = await User.findOne({ email });

  // If user is found and password is correct, send a response with user details and a JWT token for authentication
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id), // Generate JWT token for user authentication
    });
  } else {
    res.status(401); // Set response status code to 401 (Unauthorized)
    throw new Error("Invalid Email or Password"); // Throw an error indicating invalid email or password
  }
});

/************************************************************************************************ */
// Define a route handler for fetching all users
const allUsers = asyncHandler(async (req, res) => {
  // Construct a query to search for users based on name or email if provided in the query parameters
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } }, // Search by name
          { email: { $regex: req.query.search, $options: "i" } }, // Search by email
        ],
      }
    : {}; // If no search query provided, match all users

  // Fetch users from the database based on the constructed query
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  // Send a response with the fetched users
  res.send(users);
});

// Export the route handlers for user registration, authentication, and fetching all users
module.exports = { registerUser, authUser, allUsers };

/********************************************************************************************* */

/* This code defines route handlers for user registration, authentication, and fetching user data.

registerUser: Handles user registration by checking for required fields, ensuring unique email, and creating a new user in the database. Returns user details along with a JWT token for authentication.

authUser: Manages user authentication by verifying user credentials (email and password) against the database. Returns user details and a JWT token upon successful authentication.

allUsers: Fetches all users from the database, optionally filtered by name or email search query. Excludes the currently authenticated user from the results.

These route handlers utilize middleware like express-async-handler to handle asynchronous operations and ensure proper error handling. The generateToken function is used to generate JWT tokens for user authentication.*/
