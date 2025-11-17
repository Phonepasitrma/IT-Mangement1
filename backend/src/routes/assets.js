const express = require('express');
const router = express.Router();
const AssetController = require('../controllers/assetController');

// CRUD operations
router.get('/', AssetController.getAllAssets);
router.get('/:id', AssetController.getAssetById);
router.post('/', AssetController.createAsset);
router.put('/:id', AssetController.updateAsset);
router.delete('/:id', AssetController.deleteAsset);

// Special operations
router.get('/location/:locationId', AssetController.getAssetsByLocation);
router.get('/:id/qrcode', AssetController.getQRCode);
router.post('/import', AssetController.upload.single('file'), AssetController.importAssets);
router.get('/export/all', AssetController.exportAssets);

module.exports = router;
