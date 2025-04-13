const mongoose = require('mongoose');

// Cache the database connection between serverless function invocations
let cachedDb = null;

const connectDB = async () => {
  // If we already have a connection, use it
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  // If no cached connection exists, create a new one
  try {
    const uri = process.env.MONGODB_URI;
    
    // Add more detailed debugging
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string exists:', !!uri);
    
    // Connection options optimized for serverless
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Disable mongoose buffering
      serverSelectionTimeoutMS: 5000, // Reduce timeout for faster failures
    });
    
    cachedDb = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error details:');
    console.error(error);
    
    // Don't exit process in serverless - this would crash the function
    // Instead return the error so it can be handled
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

module.exports = connectDB;