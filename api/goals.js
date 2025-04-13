// api/goals.js
const mongoose = require('mongoose');
const Goal = require('../server/models/Goal');

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// API handler
export default async function handler(req, res) {
  // Connect to database
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
  
  // Handle GET request
  if (req.method === 'GET') {
    try {
      const goals = await Goal.find();
      return res.status(200).json(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      return res.status(500).json({ message: 'Error fetching goals', error: error.message });
    }
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const newGoal = new Goal(req.body);
      const savedGoal = await newGoal.save();
      return res.status(201).json(savedGoal);
    } catch (error) {
      console.error('Error creating goal:', error);
      return res.status(500).json({ message: 'Error creating goal', error: error.message });
    }
  }
  
  // Handle other HTTP methods
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}