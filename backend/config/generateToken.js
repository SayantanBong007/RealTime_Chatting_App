// Importing the `jsonwebtoken` library for generating JSON Web Tokens (JWTs)
const jwt = require("jsonwebtoken");

// Function to generate a JWT token with a given user ID
const generateToken = (id) => {
  // Generating the JWT token using `jwt.sign` method
  // The payload includes the user ID passed as the `id` parameter
  // The secret key for signing the token is retrieved from the environment variable `JWT_SECRET`
  // The token is set to expire after 30 days (`expiresIn: "30d"`)
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Exporting the `generateToken` function to be used in other parts of the application
module.exports = generateToken;
