const { poolPromise, sql } = require('../config/database');

const User = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Users');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Users WHERE UserID = @id');
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },
  
  create: async (user) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('name', sql.NVarChar(100), user.name)
        .input('role', sql.NVarChar(50), user.role)
        .input('email', sql.NVarChar(100), user.email)
        .query('INSERT INTO Users (Name, Role, Email) VALUES (@name, @role, @email); SELECT SCOPE_IDENTITY() AS id');
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  update: async (id, user) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar(100), user.name)
        .input('role', sql.NVarChar(50), user.role)
        .input('email', sql.NVarChar(100), user.email)
        .query('UPDATE Users SET Name = @name, Role = @role, Email = @email WHERE UserID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Users WHERE UserID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

module.exports = User;
