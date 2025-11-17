const ReportService = require('../services/reportService');

const ReportController = {
  getDashboardData: async (req, res) => {
    try {
      const dashboardData = await ReportService.getDashboardData();
      res.status(200).json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
  },
  
  generateAssetReport: async (req, res) => {
    try {
      const { filePath, fileName } = await ReportService.generateAssetReport();
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error generating asset report', error: error.message });
    }
  },
  
  generateBudgetReport: async (req, res) => {
    try {
      const { year } = req.query;
      const { filePath, fileName } = await ReportService.generateBudgetReport(year);
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error generating budget report', error: error.message });
    }
  },
  
  generateStockCountReport: async (req, res) => {
    try {
      const { locationId, date } = req.query;
      const { filePath, fileName } = await ReportService.generateStockCountReport(locationId, date);
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error generating stock count report', error: error.message });
    }
  }
};

module.exports = ReportController;
