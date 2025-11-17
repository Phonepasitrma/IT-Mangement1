const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

router.get('/dashboard', ReportController.getDashboardData);
router.get('/assets', ReportController.generateAssetReport);
router.get('/budget', ReportController.generateBudgetReport);
router.get('/stockcount', ReportController.generateStockCountReport);

module.exports = router;
