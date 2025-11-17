const express = require('express');
const router = express.Router();
const CheckLogController = require('../controllers/checkLogController');

// CRUD operations
router.get('/', CheckLogController.getAllCheckLogs);
router.get('/:id', CheckLogController.getCheckLogById);
router.post('/', CheckLogController.createCheckLog);

// Special operations
router.get('/asset/:assetId', CheckLogController.getCheckLogsByAsset);
router.get('/location/:locationId', CheckLogController.getCheckLogsByLocation);
router.post('/checkin/:assetId', CheckLogController.checkInAsset);
router.post('/checkout/:assetId', CheckLogController.checkOutAsset);

module.exports = router;
