const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
// No need for dotenv.config() here as Vercel loads env vars automatically

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Better error handling for database connection
app.use(async (req, res, next) => {
  // Only connect to the database for API routes to save resources
  if (req.path.startsWith('/api/')) {
    try {
      await connectDB();
      next();
    } catch (error) {
      console.error('Database connection error in middleware:', error);
      return res.status(500).json({ 
        error: 'Database connection failed',
        message: process.env.NODE_ENV === 'production' 
          ? 'Server error' 
          : error.message
      });
    }
  } else {
    next();
  }
});

// API Routes
app.use('/api/hours', require('./routes/hourRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, '../public')));

// Handle requests for HTML pages in the pages directory
app.get('/*.html', (req, res) => {
  const filename = req.path.substring(1);
  res.sendFile(path.join(__dirname, '../public/pages', filename));
});

// Redirect root to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Handle 404 errors for any other routes
app.use((req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.status(404).sendFile(path.join(__dirname, '../public/pages/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Modified for Vercel serverless environment
// Only start a listening server if not running in Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
  });
}

// Export for Vercel serverless function
module.exports = app;