require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');  
const chatRoutes = require('./routes/chatRoutes');  

// Log untuk debug
console.log('Starting server...');
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI_EXISTS: !!process.env.MONGODB_URI
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);  
app.use('/api', chatRoutes);     

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Connect to database
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Server initialization failed:', error.message);
    process.exit(1);
  });