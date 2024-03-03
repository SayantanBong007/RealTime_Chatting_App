const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

// Function to protect routes by checking for a valid JWT token in the request header
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if there is a token in the request header and if it starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the authorization header
      token = req.headers.authorization.split(" ")[1];

      // Decode the token to get the user's ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database based on the decoded ID and exclude the password field
      req.user = await User.findById(decoded.id).select("-password");

      // Call the next middleware function
      next();
    } catch (error) {
      // If there is an error in verifying the token, send a 401 Unauthorized response
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  // If there is no token in the request header, send a 401 Unauthorized response
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Export the protect function to be used in other files
module.exports = { protect };

/*
This code defines a middleware function called protect in an Express.js application. This middleware checks if there's a valid JSON Web Token (JWT) in the request header. If a token is found, it verifies and decodes it to get the user's ID. Then, it retrieves the user from the database using the ID. If no token is found or if there's an issue with the token, it sends a 401 Unauthorized response. This middleware is used to ensure that only authenticated users with valid tokens can access certain routes, adding a layer of security to the application.*/
