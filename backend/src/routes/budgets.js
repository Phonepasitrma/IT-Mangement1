const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');

// CRUD operations
router.get('/', BudgetController.getAllBudgetPlans);
router.get('/:id', BudgetController.getBudgetPlanById);
router.post('/', BudgetController.createBudgetPlan);
router.put('/:id', BudgetController.updateBudgetPlan);
router.delete('/:id', BudgetController.deleteBudgetPlan);

// Special operations
router.get('/year/:year', BudgetController.getBudgetPlansByYear);
router.get('/department/:department', BudgetController.getBudgetPlansByDepartment);
router.post('/forecast/:year', BudgetController.generateBudgetForecast);
router.put('/:id/approve', BudgetController.approveBudgetPlan);

module.exports = router;
