// api/hours/[date].js
const mongoose = require('mongoose');
const Hour = require('../../server/models/Hour');

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
  
  console.log(`API request for hours on date: ${date}`);
  
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
      const hours = await Hour.find({ date });
      console.log(`Found ${hours.length} records for date ${date}`);
      // Always return an array, even if empty
      return res.status(200).json(hours || []);
    } catch (error) {
      console.error('Error fetching hours:', error);
      // Return empty array on error to avoid frontend crashes
      return res.status(500).json([]);
    }
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const newHour = new Hour(req.body);
      const savedHour = await newHour.save();
      return res.status(201).json(savedHour);
    } catch (error) {
      console.error('Error creating hour record:', error);
      return res.status(500).json({ message: 'Error creating hour record', error: error.message });
    }
  }
  
  // Handle PUT request
  if (req.method === 'PUT') {
    try {
      const { id } = req.body;
      const updatedHour = await Hour.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(updatedHour);
    } catch (error) {
      console.error('Error updating hour record:', error);
      return res.status(500).json({ message: 'Error updating hour record', error: error.message });
    }
  }
  
  // Handle DELETE request
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await Hour.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Hour record deleted successfully' });
    } catch (error) {
      console.error('Error deleting hour record:', error);
      return res.status(500).json({ message: 'Error deleting hour record', error: error.message });
    }
  }
  
  // Handle other HTTP methods
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
};