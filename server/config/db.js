const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using Mongoose.
 * Implements resilient connection handling and clean logging.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('\x1b[33m%s\x1b[0m', '[Database Warning] MONGODB_URI is not defined in environment variables.');
    console.warn('\x1b[33m%s\x1b[0m', '[Database Warning] Database features will remain offline until MONGODB_URI is provided.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
    });

    console.log('\x1b[32m%s\x1b[0m', `[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `[Database Error] Connection failed: ${error.message}`);
    // In development or when starting without credentials, do not hard-crash the server process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false;
  }
};

// Connection event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('\x1b[33m%s\x1b[0m', '[Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('\x1b[31m%s\x1b[0m', `[Database Event Error] ${err.message}`);
});

module.exports = connectDB;
