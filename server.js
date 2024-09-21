require('dotenv').config();  // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');  // For security
const morgan = require('morgan');  // For logging
const rateLimit = require('express-rate-limit');  // For rate limiting
const cors = require('cors')
const app = express();

// Middleware: Add security headers
app.use(helmet());
app.use(cors())
// Middleware: Rate limiting to prevent abuse (e.g., max 100 requests per 10 mins)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,  // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 10 minutes",
});
app.use(limiter);

// Middleware: Log incoming requests (in production, you could log to a file)
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));  // More detailed logging in production
} else {
  app.use(morgan('dev'));  // Less detailed logging in development
}

// Middleware: Parse incoming JSON requests
app.use(bodyParser.json());

// Route: Receive parking data from NodeMCU
app.post('/parking', (req, res) => {
  try {
    const parkingData = req.body;
    console.log('Received parking data:', parkingData);

    // Process the data or store it in a database (e.g., MongoDB, MySQL)
    // Here, you could send the data to a database or perform business logic.

    // Send a response back to NodeMCU
    res.status(200).send({ message: 'Parking data received successfully!' });
  } catch (error) {
    console.error('Error processing parking data:', error);
    res.status(500).send({ error: 'Failed to process parking data' });
  }
});

// Error handling: Catch-all for unhandled routes
app.use((req, res) => {
  res.status(404).send({ error: 'Route not found' });
});

// Error handling middleware: Handle internal server errors
app.use((err, req, res, next) => {
  console.error('Internal server error:', err.stack);
  res.status(500).send({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
