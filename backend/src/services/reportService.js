const ExcelService = require('./excelService');
const Asset = require('../models/asset');
const BudgetPlan = require('../models/budgetPlan');
const StockCount = require('../models/stockCount');
const Location = require('../models/location');

const ReportService = {
  generateAssetReport: async () => {
    try {
      const assets = await Asset.getAll();
      const formattedData = ExcelService.formatAssetsForExport(assets);
      const fileName = `assets_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const filePath = ExcelService.generateExcelFile(formattedData, fileName);
      return { filePath, fileName };
    } catch (error) {
      console.error('Error generating asset report:', error);
      throw error;
    }
  },
  
  generateBudgetReport: async (year) => {
    try {
      const budgetPlans = year ? await BudgetPlan.getByYear(year) : await BudgetPlan.getAll();
      const formattedData = ExcelService.formatBudgetPlansForExport(budgetPlans);
      const fileName = `budget_report_${year || 'all'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const filePath = ExcelService.generateExcelFile(formattedData, fileName);
      return { filePath, fileName };
    } catch (error) {
      console.error('Error generating budget report:', error);
      throw error;
    }
  },
  
  generateStockCountReport: async (locationId, date) => {
    try {
      let stockCounts;
      if (locationId && date) {
        stockCounts = await StockCount.getByLocation(locationId);
        stockCounts = stockCounts.filter(count => count.CountDate.toISOString().slice(0, 10) === date);
      } else if (locationId) {
        stockCounts = await StockCount.getByLocation(locationId);
      } else if (date) {
        stockCounts = await StockCount.getByDate(date);
      } else {
        stockCounts = await StockCount.getAll();
      }
      
      const formattedData = ExcelService.formatStockCountsForExport(stockCounts);
      const fileName = `stock_count_report_${locationId || 'all'}_${date || 'all'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const filePath = ExcelService.generateExcelFile(formattedData, fileName);
      return { filePath, fileName };
    } catch (error) {
      console.error('Error generating stock count report:', error);
      throw error;
    }
  },
  
  generateBudgetForecast: async (year) => {
    try {
      // Get assets older than 5 years
      const oldAssets = await Asset.getOldAssets(5);
      
      // Group by department
      const assetsByDepartment = {};
      oldAssets.forEach(asset => {
        const department = asset.Department;
        if (!assetsByDepartment[department]) {
          assetsByDepartment[department] = [];
        }
        assetsByDepartment[department].push(asset);
      });
      
      // Calculate replacement cost for each department
      const forecast = [];
      for (const department in assetsByDepartment) {
        const assets = assetsByDepartment[department];
        const totalReplacementCost = assets.reduce((sum, asset) => sum + asset.PurchasePrice, 0);
        
        forecast.push({
          Department: department,
          Year: year,
          AssetsToReplace: assets.length,
          TotalReplacementCost: totalReplacementCost
        });
      }
      
      // Save or update budget plans
      for (const item of forecast) {
        const existingPlan = await BudgetPlan.getByYear(item.Year)
          .then(plans => plans.find(plan => plan.Department === item.Department));
        
        if (existingPlan) {
          await BudgetPlan.update(existingPlan.PlanID, {
            year: item.Year,
            department: item.Department,
            estimatedReplacementCost: item.TotalReplacementCost,
            approved: existingPlan.Approved
          });
        } else {
          await BudgetPlan.create({
            year: item.Year,
            department: item.Department,
            estimatedReplacementCost: item.TotalReplacementCost,
            approved: false
          });
        }
      }
      
      return forecast;
    } catch (error) {
      console.error('Error generating budget forecast:', error);
      throw error;
    }
  },
  
  getDashboardData: async () => {
    try {
      // Get total assets per location
      const locations = await Location.getAll();
      const assetsByLocation = [];
      
      for (const location of locations) {
        const assets = await Asset.getByLocation(location.LocationID);
        assetsByLocation.push({
          locationName: location.LocationName,
          department: location.Department,
          totalAssets: assets.length
        });
      }
      
      // Get assets due for replacement (older than 5 years)
      const oldAssets = await Asset.getOldAssets(5);
      
      // Get stock discrepancies
      const stockCounts = await StockCount.getAll();
      const discrepancies = stockCounts.filter(count => count.Status !== 'Matched');
      
      // Get budget forecast
      const currentYear = new Date().getFullYear();
      const budgetPlans = await BudgetPlan.getByYear(currentYear);
      
      return {
        assetsByLocation,
        assetsDueForReplacement: oldAssets.length,
        stockDiscrepancies: discrepancies.length,
        budgetForecast: budgetPlans
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
};

module.exports = ReportService;
