const { poolPromise, sql } = require('../config/database');

const Config = {
  // Main Categories
  getAllMainCategories: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query('SELECT * FROM MainCategories WHERE IsActive = 1 ORDER BY CategoryName');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching main categories:', error);
      throw error;
    }
  },

  createMainCategory: async (data) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('categoryName', sql.NVarChar(100), data.categoryName)
        .input('categoryCode', sql.NVarChar(10), data.categoryCode)
        .input('description', sql.NVarChar(500), data.description)
        .query(`
          INSERT INTO MainCategories (CategoryName, CategoryCode, Description)
          VALUES (@categoryName, @categoryCode, @description);
          SELECT SCOPE_IDENTITY() AS id;
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating main category:', error);
      throw error;
    }
  },

  updateMainCategory: async (id, data) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .input('categoryName', sql.NVarChar(100), data.categoryName)
        .input('categoryCode', sql.NVarChar(10), data.categoryCode)
        .input('description', sql.NVarChar(500), data.description)
        .query(`
          UPDATE MainCategories
          SET CategoryName = @categoryName,
              CategoryCode = @categoryCode,
              Description = @description,
              UpdatedAt = GETDATE()
          WHERE MainCategoryID = @id
        `);
      return { success: true };
    } catch (error) {
      console.error('Error updating main category:', error);
      throw error;
    }
  },

  deleteMainCategory: async (id) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE MainCategories SET IsActive = 0 WHERE MainCategoryID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error deleting main category:', error);
      throw error;
    }
  },

  // Categories
  getAllCategories: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT c.*, mc.CategoryName as MainCategoryName
          FROM Categories c
          JOIN MainCategories mc ON c.MainCategoryID = mc.MainCategoryID
          WHERE c.IsActive = 1
          ORDER BY mc.CategoryName, c.CategoryName
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  createCategory: async (data) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('categoryName', sql.NVarChar(100), data.categoryName)
        .input('mainCategoryId', sql.Int, data.mainCategoryId)
        .input('description', sql.NVarChar(500), data.description)
        .query(`
          INSERT INTO Categories (CategoryName, MainCategoryID, Description)
          VALUES (@categoryName, @mainCategoryId, @description);
          SELECT SCOPE_IDENTITY() AS id;
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .input('categoryName', sql.NVarChar(100), data.categoryName)
        .input('mainCategoryId', sql.Int, data.mainCategoryId)
        .input('description', sql.NVarChar(500), data.description)
        .query(`
          UPDATE Categories
          SET CategoryName = @categoryName,
              MainCategoryID = @mainCategoryId,
              Description = @description,
              UpdatedAt = GETDATE()
          WHERE CategoryID = @id
        `);
      return { success: true };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE Categories SET IsActive = 0 WHERE CategoryID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Departments
  getAllDepartments: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query('SELECT * FROM Departments WHERE IsActive = 1 ORDER BY DepartmentName');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  createDepartment: async (data) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('departmentName', sql.NVarChar(100), data.departmentName)
        .input('description', sql.NVarChar(500), data.description)
        .query(`
          INSERT INTO Departments (DepartmentName, Description)
          VALUES (@departmentName, @description);
          SELECT SCOPE_IDENTITY() AS id;
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },

  updateDepartment: async (id, data) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .input('departmentName', sql.NVarChar(100), data.departmentName)
        .input('description', sql.NVarChar(500), data.description)
        .query(`
          UPDATE Departments
          SET DepartmentName = @departmentName,
              Description = @description,
              UpdatedAt = GETDATE()
          WHERE DepartmentID = @id
        `);
      return { success: true };
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  },

  deleteDepartment: async (id) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE Departments SET IsActive = 0 WHERE DepartmentID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },

  // Companies
  getAllCompanies: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query('SELECT * FROM Companies ORDER BY CompanyName');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  createCompany: async (data) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('companyName', sql.NVarChar(200), data.companyName)
        .input('companyCode', sql.NVarChar(4), data.companyCode)
        .query(`
          INSERT INTO Companies (CompanyName, CompanyCode)
          VALUES (@companyName, @companyCode);
          SELECT SCOPE_IDENTITY() AS id;
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  updateCompany: async (id, data) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .input('companyName', sql.NVarChar(200), data.companyName)
        .input('companyCode', sql.NVarChar(4), data.companyCode)
        .query(`
          UPDATE Companies
          SET CompanyName = @companyName,
              CompanyCode = @companyCode
          WHERE CompanyID = @id
        `);
      return { success: true };
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  deleteCompany: async (id) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Companies WHERE CompanyID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  // Users
  getAllUsers: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT u.*, m.Username as ManagerName
          FROM Users u
          LEFT JOIN Users m ON u.ManagerID = m.UserID
          ORDER BY u.Username
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  createUser: async (data) => {
    try {
      const pool = await poolPromise;
      
      // In production, hash the password with bcrypt
      // For now, store plain text (NOT RECOMMENDED FOR PRODUCTION)
      const password = data.password || data.username; // Default to username if no password provided
      
      const result = await pool.request()
        .input('employeeId', sql.NVarChar(50), data.employeeId)
        .input('username', sql.NVarChar(100), data.username)
        .input('email', sql.NVarChar(200), data.email)
        .input('department', sql.NVarChar(100), data.department)
        .input('position', sql.NVarChar(100), data.position || null)
        .input('userType', sql.NVarChar(50), data.userType || 'User')
        .input('isActive', sql.Bit, data.isActive !== undefined ? data.isActive : true)
        .input('managerId', sql.Int, data.managerId || null)
        .input('password', sql.NVarChar(255), password)
        .input('requirePasswordChange', sql.Bit, data.requirePasswordChange || false)
        .query(`
          INSERT INTO Users (EmployeeID, Username, Email, Department, Position, UserType, IsActive, ManagerID, Password, RequirePasswordChange)
          VALUES (@employeeId, @username, @email, @department, @position, @userType, @isActive, @managerId, @password, @requirePasswordChange);
          SELECT SCOPE_IDENTITY() AS id;
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const pool = await poolPromise;
      
      // Build dynamic query based on whether password is being updated
      let query = `
        UPDATE Users
        SET EmployeeID = @employeeId,
            Username = @username,
            Email = @email,
            Department = @department,
            Position = @position,
            UserType = @userType,
            IsActive = @isActive,
            ManagerID = @managerId,
            RequirePasswordChange = @requirePasswordChange,
            UpdatedAt = GETDATE()
      `;
      
      const request = pool.request()
        .input('id', sql.Int, id)
        .input('employeeId', sql.NVarChar(50), data.employeeId)
        .input('username', sql.NVarChar(100), data.username)
        .input('email', sql.NVarChar(200), data.email)
        .input('department', sql.NVarChar(100), data.department)
        .input('position', sql.NVarChar(100), data.position || null)
        .input('userType', sql.NVarChar(50), data.userType)
        .input('isActive', sql.Bit, data.isActive)
        .input('managerId', sql.Int, data.managerId || null)
        .input('requirePasswordChange', sql.Bit, data.requirePasswordChange || false);
      
      // Only update password if provided
      if (data.password) {
        query += `, Password = @password`;
        request.input('password', sql.NVarChar(255), data.password);
      }
      
      query += ` WHERE UserID = @id`;
      
      await request.query(query);
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE Users SET IsActive = 0 WHERE UserID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

};

module.exports = Config;
