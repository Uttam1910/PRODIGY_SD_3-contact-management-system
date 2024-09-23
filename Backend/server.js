// server.js

const dotenv = require('dotenv');
const app = require('./app'); // Import the express app
const connectDB = require('./config/db'); // Import the DB connection function

dotenv.config(); // Load environment variables

// Connect to MongoDB and then start the server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
});
