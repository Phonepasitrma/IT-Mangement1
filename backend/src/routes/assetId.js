const express = require('express');
const router = express.Router();
const AssetIdGenerator = require('../services/assetIdGenerator');

router.post('/generate', async (req, res) => {
  try {
    const { mainCategory, companyId, locationId, purchaseDate } = req.body;
    
    if (!mainCategory || !companyId || !locationId || !purchaseDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const assetId = await AssetIdGenerator.generateAssetId(
      mainCategory,
      companyId,
      locationId,
      purchaseDate
    );
    
    res.status(200).json({ assetId });
  } catch (error) {
    res.status(500).json({ message: 'Error generating asset ID', error: error.message });
  }
});

module.exports = router;
