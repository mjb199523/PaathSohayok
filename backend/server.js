const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route Imports
const authRoutes = require('./routes/auth');
const generatorRoutes = require('./routes/generator');
const adminRoutes = require('./routes/admin');
const creationRoutes = require('./routes/creations');
const publicRoutes = require('./routes/public');
const assessmentRoutes = require('./routes/assessment');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/creations', creationRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/assessment', assessmentRoutes);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'PaathMitra API is running', env: process.env.NODE_ENV || 'development' });
});

// Local Start
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
