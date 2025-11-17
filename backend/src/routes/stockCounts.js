const express = require('express');
const router = express.Router();
const StockCountController = require('../controllers/stockCountController');

// CRUD operations
router.get('/', StockCountController.getAllStockCounts);
router.get('/:id', StockCountController.getStockCountById);
router.post('/', StockCountController.createStockCount);

// Special operations
router.get('/location/:locationId', StockCountController.getStockCountsByLocation);
router.get('/date/:date', StockCountController.getStockCountsByDate);
router.get('/summary', StockCountController.getStockCountSummary);
router.post('/perform', StockCountController.performStockCount);

module.exports = router;
