// api/goals/day/[date].js
const mongoose = require('mongoose');
const Goal = require('../../../server/models/Goal');

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
  // Extract date from URL
  const { date } = req.query;
  
  console.log(`API request for day goals on date: ${date}`);
  
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
      const goals = await Goal.find({ 
        date: date,
        type: 'day'
      });
      console.log(`Found ${goals.length} day goals for date ${date}`);
      // Always return an array, even if empty
      return res.status(200).json(goals || []);
    } catch (error) {
      console.error('Error fetching day goals:', error);
      // Return empty array on error to avoid frontend crashes
      return res.status(500).json([]);
    }
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const newGoal = new Goal({
        ...req.body,
        type: 'day',
        date: date
      });
      const savedGoal = await newGoal.save();
      return res.status(201).json(savedGoal);
    } catch (error) {
      console.error('Error creating day goal:', error);
      return res.status(500).json({ message: 'Error creating day goal', error: error.message });
    }
  }
  
  // Handle other HTTP methods
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
};