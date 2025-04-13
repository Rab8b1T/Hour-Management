// api/hours/[date].js
const mongoose = require('mongoose');
const Hour = require('../../server/models/Hour');

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
  // Extract date from URL
  const { date } = req.query;
  
  console.log(`API request for hours on date: ${date}`);
  
  // Connect to database
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
  
  // Handle GET request
  if (req.method === 'GET') {
    try {
      const hours = await Hour.find({ date });
      console.log(`Found ${hours.length} records for date ${date}`);
      return res.status(200).json(hours);
    } catch (error) {
      console.error('Error fetching hours:', error);
      return res.status(500).json({ message: 'Error fetching hours', error: error.message });
    }
  }
  
  // Handle other HTTP methods
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}