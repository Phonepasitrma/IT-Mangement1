const { poolPromise, sql } = require('../config/database');

const BudgetPlan = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM BudgetPlans ORDER BY Year DESC, Department');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching budget plans:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM BudgetPlans WHERE PlanID = @id');
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching budget plan:', error);
      throw error;
    }
  },
  
  create: async (budgetPlan) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('year', sql.Int, budgetPlan.year)
        .input('department', sql.NVarChar(100), budgetPlan.department)
        .input('estimatedReplacementCost', sql.Decimal(18, 2), budgetPlan.estimatedReplacementCost)
        .input('approved', sql.Bit, budgetPlan.approved)
        .query(`
          INSERT INTO BudgetPlans (Year, Department, EstimatedReplacementCost, Approved) 
          VALUES (@year, @department, @estimatedReplacementCost, @approved);
          SELECT SCOPE_IDENTITY() AS id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating budget plan:', error);
      throw error;
    }
  },
  
  update: async (id, budgetPlan) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .input('year', sql.Int, budgetPlan.year)
        .input('department', sql.NVarChar(100), budgetPlan.department)
        .input('estimatedReplacementCost', sql.Decimal(18, 2), budgetPlan.estimatedReplacementCost)
        .input('approved', sql.Bit, budgetPlan.approved)
        .query(`
          UPDATE BudgetPlans 
          SET Year = @year, Department = @department, EstimatedReplacementCost = @estimatedReplacementCost, 
              Approved = @approved, UpdatedAt = GETDATE()
          WHERE PlanID = @id
        `);
      return { success: true };
    } catch (error) {
      console.error('Error updating budget plan:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM BudgetPlans WHERE PlanID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error deleting budget plan:', error);
      throw error;
    }
  },
  
  getByYear: async (year) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('year', sql.Int, year)
        .query('SELECT * FROM BudgetPlans WHERE Year = @year ORDER BY Department');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching budget plans by year:', error);
      throw error;
    }
  },
  
  getByDepartment: async (department) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('department', sql.NVarChar(100), department)
        .query('SELECT * FROM BudgetPlans WHERE Department = @department ORDER BY Year DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching budget plans by department:', error);
      throw error;
    }
  }
};

module.exports = BudgetPlan;
