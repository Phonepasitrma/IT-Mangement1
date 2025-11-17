const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const assetRoutes = require('./src/routes/assets');
const authRoutes = require('./src/routes/auth');
const budgetRoutes = require('./src/routes/budgets');
const checkLogRoutes = require('./src/routes/checkLogs');
const locationRoutes = require('./src/routes/locations');
const reportRoutes = require('./src/routes/reports');
const stockCountRoutes = require('./src/routes/stockCounts');
const userRoutes = require('./src/routes/users');
const assetIdRoutes = require('./src/routes/assetId');
const configRoutes = require('./src/routes/config');
const syncRoutes = require('./src/routes/sync');
const excelRoutes = require('./src/routes/excel');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files for QR codes
app.use('/qrcodes', express.static(path.join(__dirname, 'qrcodes')));

// API Routes
app.use('/api/assets', assetRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/checklogs', checkLogRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stockcounts', stockCountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assetid', assetIdRoutes);
app.use('/api/config', configRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/excel', excelRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;