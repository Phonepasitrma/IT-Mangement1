const BudgetPlan = require('../models/budgetPlan');
const ReportService = require('../services/reportService');

const BudgetController = {
  getAllBudgetPlans: async (req, res) => {
    try {
      const plans = await BudgetPlan.getAll();
      res.status(200).json(plans);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching budget plans', error: error.message });
    }
  },
  
  getBudgetPlanById: async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await BudgetPlan.getById(id);
      
      if (!plan) {
        return res.status(404).json({ message: 'Budget plan not found' });
      }
      
      res.status(200).json(plan);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching budget plan', error: error.message });
    }
  },
  
  createBudgetPlan: async (req, res) => {
    try {
      const planData = req.body;
      const result = await BudgetPlan.create(planData);
      res.status(201).json({ message: 'Budget plan created successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error creating budget plan', error: error.message });
    }
  },
  
  updateBudgetPlan: async (req, res) => {
    try {
      const { id } = req.params;
      const planData = req.body;
      const result = await BudgetPlan.update(id, planData);
      res.status(200).json({ message: 'Budget plan updated successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error updating budget plan', error: error.message });
    }
  },
  
  deleteBudgetPlan: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await BudgetPlan.delete(id);
      res.status(200).json({ message: 'Budget plan deleted successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting budget plan', error: error.message });
    }
  },
  
  getBudgetPlansByYear: async (req, res) => {
    try {
      const { year } = req.params;
      const plans = await BudgetPlan.getByYear(year);
      res.status(200).json(plans);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching budget plans by year', error: error.message });
    }
  },
  
  getBudgetPlansByDepartment: async (req, res) => {
    try {
      const { department } = req.params;
      const plans = await BudgetPlan.getByDepartment(department);
      res.status(200).json(plans);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching budget plans by department', error: error.message });
    }
  },
  
  generateBudgetForecast: async (req, res) => {
    try {
      const { year } = req.params;
      const forecast = await ReportService.generateBudgetForecast(year);
      res.status(200).json({ message: 'Budget forecast generated successfully', forecast });
    } catch (error) {
      res.status(500).json({ message: 'Error generating budget forecast', error: error.message });
    }
  },
  
  approveBudgetPlan: async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await BudgetPlan.getById(id);
      
      if (!plan) {
        return res.status(404).json({ message: 'Budget plan not found' });
      }
      
      const result = await BudgetPlan.update(id, { ...plan, approved: true });
      res.status(200).json({ message: 'Budget plan approved successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error approving budget plan', error: error.message });
    }
  }
};

module.exports = BudgetController;
