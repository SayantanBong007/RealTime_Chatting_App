// Define a middleware function to handle 404 Not Found errors
const notFound = (req, res, next) => {
  // Create a new Error object with a descriptive message including the original URL
  const error = new Error(`Not Found - ${req.originalUrl}`);
  // Set the HTTP status code to 404 (Not Found)
  res.status(404);
  // Pass the error to the next middleware in the stack
  next(error);
};

// Define a middleware function to handle errors
const errorHandler = (err, req, res, next) => {
  // Determine the status code based on the current response status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  // Set the HTTP status code to the determined status code
  res.status(statusCode);
  // Send a JSON response with the error message and stack trace (if not in production)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// Export the middleware functions for use in other parts of the application
module.exports = { notFound, errorHandler };

/* These middleware functions handle common scenarios in an Express application:

notFound: This middleware is triggered when a requested route is not found (404 error). It creates an Error object with a message indicating the original URL, sets the response status to 404, and passes the error to the next middleware.

errorHandler: This middleware is used to handle errors that occur during the request processing pipeline. It determines the appropriate HTTP status code based on the current response status code and sends a JSON response containing the error message and stack trace (in non-production environments) to the client.

Both middleware functions are essential for error handling and providing meaningful responses to clients when unexpected errors or missing routes occur in the application. They ensure that the server responds appropriately with relevant error information, improving the overall user experience.*/
