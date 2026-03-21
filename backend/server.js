const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const generatorRoutes = require('./routes/generator');
const adminRoutes = require('./routes/admin');
const creationRoutes = require('./routes/creations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/creations', creationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'PaathMitra API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
