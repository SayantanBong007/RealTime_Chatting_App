const mongoose = require("mongoose");

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Attempt to establish a connection to the MongoDB database using the provided URI
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If the connection is successful, log a success message
    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
  } catch (err) {
    // If an error occurs during the connection attempt, log the error message
    console.error(`Error: ${err.message}`.red.bold);
    // Exit the process with a non-zero status code to indicate failure
    process.exit(1);
  }
};

// Export the connectDB function to be used in other modules
module.exports = connectDB;
