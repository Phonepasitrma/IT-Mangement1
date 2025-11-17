const Asset = require('../models/asset');
const QRCodeService = require('../services/qrCodeService');
const ExcelService = require('../services/excelService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const AssetController = {
  getAllAssets: async (req, res) => {
    try {
      const assets = await Asset.getAll();
      res.status(200).json(assets);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assets', error: error.message });
    }
  },
  
  getAssetById: async (req, res) => {
    try {
      const { id } = req.params;
      const asset = await Asset.getById(id);
      
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      
      res.status(200).json(asset);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching asset', error: error.message });
    }
  },
  
  createAsset: async (req, res) => {
    try {
      const assetData = req.body;
      
      // Generate QR code for the asset
      const qrCode = await QRCodeService.generateAssetQRCode(assetData.assetId);
      assetData.qrCode = qrCode;
      
      const result = await Asset.create(assetData);
      res.status(201).json({ message: 'Asset created successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error creating asset', error: error.message });
    }
  },
  
  updateAsset: async (req, res) => {
    try {
      const { id } = req.params;
      const assetData = req.body;
      
      const result = await Asset.update(id, assetData);
      res.status(200).json({ message: 'Asset updated successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error updating asset', error: error.message });
    }
  },
  
  deleteAsset: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Asset.delete(id);
      res.status(200).json({ message: 'Asset deleted successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting asset', error: error.message });
    }
  },
  
  getAssetsByLocation: async (req, res) => {
    try {
      const { locationId } = req.params;
      const assets = await Asset.getByLocation(locationId);
      res.status(200).json(assets);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assets by location', error: error.message });
    }
  },
  
  importAssets: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const filePath = req.file.path;
      const data = await ExcelService.parseExcelFile(filePath);
      
      // Process and insert assets
      const results = [];
      for (const row of data) {
        try {
          // Generate QR code for the asset
          const qrCode = await QRCodeService.generateAssetQRCode(row['Asset ID']);
          
          const assetData = {
            assetId: row['Asset ID'],
            assetName: row['Asset Name'],
            category: row['Category'],
            purchaseDate: row['Purchase Date'],
            purchasePrice: row['Purchase Price'],
            depreciationValue: row['Depreciation Value'] || 0,
            currentValue: row['Current Value'] || row['Purchase Price'],
            locationId: row['Location ID'],
            qrCode: qrCode,
            status: row['Status'] || 'Available'
          };
          
          await Asset.create(assetData);
          results.push({ success: true, assetId: row['Asset ID'] });
        } catch (error) {
          results.push({ success: false, assetId: row['Asset ID'], error: error.message });
        }
      }
      
      res.status(200).json({ message: 'Assets import completed', results });
    } catch (error) {
      res.status(500).json({ message: 'Error importing assets', error: error.message });
    }
  },
  
  exportAssets: async (req, res) => {
    try {
      const assets = await Asset.getAll();
      const formattedData = ExcelService.formatAssetsForExport(assets);
      const fileName = `assets_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const filePath = ExcelService.generateExcelFile(formattedData, fileName);
      
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error exporting assets', error: error.message });
    }
  },
  
  getQRCode: async (req, res) => {
    try {
      const { id } = req.params;
      const asset = await Asset.getById(id);
      
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      
      // Generate QR code if not exists
      let qrCode = asset.QRCode;
      if (!qrCode) {
        qrCode = await QRCodeService.generateAssetQRCode(id);
        await Asset.update(id, { ...asset, qrCode });
      }
      
      res.status(200).json({ qrCode });
    } catch (error) {
      res.status(500).json({ message: 'Error generating QR code', error: error.message });
    }
  }
};

module.exports = {
  ...AssetController,
  upload
};
