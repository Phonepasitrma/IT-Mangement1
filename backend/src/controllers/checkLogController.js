const CheckLog = require('../models/checkLog');
const Asset = require('../models/asset');

const CheckLogController = {
  getAllCheckLogs: async (req, res) => {
    try {
      const logs = await CheckLog.getAll();
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching check logs', error: error.message });
    }
  },
  
  getCheckLogById: async (req, res) => {
    try {
      const { id } = req.params;
      const log = await CheckLog.getById(id);
      
      if (!log) {
        return res.status(404).json({ message: 'Check log not found' });
      }
      
      res.status(200).json(log);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching check log', error: error.message });
    }
  },
  
  createCheckLog: async (req, res) => {
    try {
      const logData = req.body;
      
      // Get current user ID from request (for now, use mock user)
      logData.userId = req.user ? req.user.id : 1; // Default to admin user
      
      // Get asset details
      const asset = await Asset.getById(logData.assetId);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      
      // Create check log
      const result = await CheckLog.create(logData);
      
      // Update asset status based on action type
      if (logData.actionType === 'CheckOut') {
        await Asset.update(logData.assetId, { ...asset, status: 'Checked Out' });
      } else if (logData.actionType === 'CheckIn') {
        await Asset.update(logData.assetId, { ...asset, status: 'Available' });
      }
      
      res.status(201).json({ message: 'Check log created successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error creating check log', error: error.message });
    }
  },
  
  getCheckLogsByAsset: async (req, res) => {
    try {
      const { assetId } = req.params;
      const logs = await CheckLog.getByAsset(assetId);
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching check logs by asset', error: error.message });
    }
  },
  
  getCheckLogsByLocation: async (req, res) => {
    try {
      const { locationId } = req.params;
      const logs = await CheckLog.getByLocation(locationId);
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching check logs by location', error: error.message });
    }
  },
  
  checkInAsset: async (req, res) => {
    try {
      const { assetId } = req.params;
      const { locationId, notes } = req.body;
      
      // Get current user ID from request (for now, use mock user)
      const userId = req.user ? req.user.id : 1; // Default to admin user
      
      // Get asset details
      const asset = await Asset.getById(assetId);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      
      // Create check-in log
      const logData = {
        assetId,
        userId,
        locationId,
        actionType: 'CheckIn',
        notes
      };
      
      await CheckLog.create(logData);
      
      // Update asset status
      await Asset.update(assetId, { ...asset, status: 'Available', locationId });
      
      res.status(200).json({ message: 'Asset checked in successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error checking in asset', error: error.message });
    }
  },
  
  checkOutAsset: async (req, res) => {
    try {
      const { assetId } = req.params;
      const { locationId, notes } = req.body;
      
      // Get current user ID from request (for now, use mock user)
      const userId = req.user ? req.user.id : 1; // Default to admin user
      
      // Get asset details
      const asset = await Asset.getById(assetId);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      
      // Create check-out log
      const logData = {
        assetId,
        userId,
        locationId,
        actionType: 'CheckOut',
        notes
      };
      
      await CheckLog.create(logData);
      
      // Update asset status
      await Asset.update(assetId, { ...asset, status: 'Checked Out' });
      
      res.status(200).json({ message: 'Asset checked out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error checking out asset', error: error.message });
    }
  }
};

module.exports = CheckLogController;
