// api/goals/index.js
const mongoose = require('mongoose');
const Goal = require('../../server/models/Goal');

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// API handler
module.exports = async (req, res) => {
  // Connect to database
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
  
  // Handle GET request
  if (req.method === 'GET') {
    try {
      const goals = await Goal.find();
      console.log(`Found ${goals.length} goals total`);
      // Always return an array, even if empty
      return res.status(200).json(goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Return empty array on error to avoid frontend crashes
      return res.status(500).json([]);
    }
  }
  
  // Handle other HTTP methods
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
};