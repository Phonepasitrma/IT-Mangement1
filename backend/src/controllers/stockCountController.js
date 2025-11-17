const StockCount = require('../models/stockCount');
const Asset = require('../models/asset');

const StockCountController = {
  getAllStockCounts: async (req, res) => {
    try {
      const counts = await StockCount.getAll();
      res.status(200).json(counts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stock counts', error: error.message });
    }
  },
  
  getStockCountById: async (req, res) => {
    try {
      const { id } = req.params;
      const count = await StockCount.getById(id);
      
      if (!count) {
        return res.status(404).json({ message: 'Stock count not found' });
      }
      
      res.status(200).json(count);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stock count', error: error.message });
    }
  },
  
  createStockCount: async (req, res) => {
    try {
      const countData = req.body;
      
      // Get current user ID from request (for now, use mock user)
      countData.userId = req.user ? req.user.id : 1; // Default to admin user
      
      const result = await StockCount.create(countData);
      res.status(201).json({ message: 'Stock count created successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error creating stock count', error: error.message });
    }
  },
  
  getStockCountsByLocation: async (req, res) => {
    try {
      const { locationId } = req.params;
      const counts = await StockCount.getByLocation(locationId);
      res.status(200).json(counts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stock counts by location', error: error.message });
    }
  },
  
  getStockCountsByDate: async (req, res) => {
    try {
      const { date } = req.params;
      const counts = await StockCount.getByDate(date);
      res.status(200).json(counts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stock counts by date', error: error.message });
    }
  },
  
  getStockCountSummary: async (req, res) => {
    try {
      const { locationId, date } = req.query;
      
      if (!locationId || !date) {
        return res.status(400).json({ message: 'Location ID and date are required' });
      }
      
      const summary = await StockCount.getSummary(locationId, date);
      res.status(200).json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stock count summary', error: error.message });
    }
  },
  
  performStockCount: async (req, res) => {
    try {
      const { locationId, scannedAssets, date } = req.body;
      
      // Get current user ID from request (for now, use mock user)
      const userId = req.user ? req.user.id : 1; // Default to admin user
      
      // Get all assets for the location
      const locationAssets = await Asset.getByLocation(locationId);
      
      // Create stock count records
      const results = [];
      
      // Process scanned assets
      for (const scannedAsset of scannedAssets) {
        const asset = locationAssets.find(a => a.AssetID === scannedAsset.assetId);
        
        if (asset) {
          // Asset exists in location
          await StockCount.create({
            locationId,
            assetId: scannedAsset.assetId,
            userId,
            countDate: date,
            status: 'Matched',
            notes: scannedAsset.notes || ''
          });
          
          results.push({ assetId: scannedAsset.assetId, status: 'Matched' });
        } else {
          // Asset doesn't exist in location (extra)
          await StockCount.create({
            locationId,
            assetId: scannedAsset.assetId,
            userId,
            countDate: date,
            status: 'Extra',
            notes: scannedAsset.notes || 'Asset not found in this location'
          });
          
          results.push({ assetId: scannedAsset.assetId, status: 'Extra' });
        }
      }
      
      // Find missing assets
      const scannedAssetIds = scannedAssets.map(a => a.assetId);
      const missingAssets = locationAssets.filter(asset => !scannedAssetIds.includes(asset.AssetID));
      
      for (const missingAsset of missingAssets) {
        await StockCount.create({
          locationId,
          assetId: missingAsset.AssetID,
          userId,
          countDate: date,
          status: 'Missing',
          notes: 'Asset not found during stock count'
        });
        
        results.push({ assetId: missingAsset.AssetID, status: 'Missing' });
      }
      
      res.status(200).json({ message: 'Stock count completed successfully', results });
    } catch (error) {
      res.status(500).json({ message: 'Error performing stock count', error: error.message });
    }
  }
};

module.exports = StockCountController;
