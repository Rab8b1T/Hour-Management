// api/goals/week/[date].js
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

// Get the start of week date
function getWeekStartDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = date.getDate() - day;
  const startOfWeek = new Date(date.setDate(diff));
  return startOfWeek.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// API handler
module.exports = async (req, res) => {
  // Extract date from URL
  const { date } = req.query;
  
  // Calculate the week start date
  const weekStartDate = getWeekStartDate(date);
  
  console.log(`API request for week goals: date=${date}, weekStartDate=${weekStartDate}`);
  
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
        date: weekStartDate,
        type: 'week'
      });
      console.log(`Found ${goals.length} week goals for week starting ${weekStartDate}`);
      // Always return an array, even if empty
      return res.status(200).json(goals || []);
    } catch (error) {
      console.error('Error fetching week goals:', error);
      // Return empty array on error to avoid frontend crashes
      return res.status(500).json([]);
    }
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const newGoal = new Goal({
        ...req.body,
        type: 'week',
        date: weekStartDate
      });
      const savedGoal = await newGoal.save();
      return res.status(201).json(savedGoal);
    } catch (error) {
      console.error('Error creating week goal:', error);
      return res.status(500).json({ message: 'Error creating week goal', error: error.message });
    }
  }
  
  // Handle other HTTP methods
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
};