const { poolPromise, sql } = require('../config/database');

const Location = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Locations');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Locations WHERE LocationID = @id');
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  },
  
  create: async (location) => {
    try {
      const pool = await poolPromise;
      
      // Check if Department and LocationCode columns exist
      const columnCheck = await pool.request()
        .query(`
          SELECT 
            SUM(CASE WHEN name = 'Department' THEN 1 ELSE 0 END) as hasDepartment,
            SUM(CASE WHEN name = 'LocationCode' THEN 1 ELSE 0 END) as hasLocationCode
          FROM sys.columns 
          WHERE object_id = OBJECT_ID('Locations')
        `);
      
      const hasDepartment = columnCheck.recordset[0].hasDepartment > 0;
      const hasLocationCode = columnCheck.recordset[0].hasLocationCode > 0;
      
      let result;
      if (hasDepartment && hasLocationCode) {
        result = await pool.request()
          .input('locationName', sql.NVarChar(100), location.locationName)
          .input('locationCode', sql.NVarChar(3), location.locationCode)
          .input('department', sql.NVarChar(100), location.department || null)
          .query('INSERT INTO Locations (LocationName, LocationCode, Department) VALUES (@locationName, @locationCode, @department); SELECT SCOPE_IDENTITY() AS id');
      } else if (hasDepartment) {
        result = await pool.request()
          .input('locationName', sql.NVarChar(100), location.locationName)
          .input('department', sql.NVarChar(100), location.department || null)
          .query('INSERT INTO Locations (LocationName, Department) VALUES (@locationName, @department); SELECT SCOPE_IDENTITY() AS id');
      } else {
        result = await pool.request()
          .input('locationName', sql.NVarChar(100), location.locationName)
          .query('INSERT INTO Locations (LocationName) VALUES (@locationName); SELECT SCOPE_IDENTITY() AS id');
      }
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },
  
  update: async (id, location) => {
    try {
      const pool = await poolPromise;
      
      // Check if Department and LocationCode columns exist
      const columnCheck = await pool.request()
        .query(`
          SELECT 
            SUM(CASE WHEN name = 'Department' THEN 1 ELSE 0 END) as hasDepartment,
            SUM(CASE WHEN name = 'LocationCode' THEN 1 ELSE 0 END) as hasLocationCode
          FROM sys.columns 
          WHERE object_id = OBJECT_ID('Locations')
        `);
      
      const hasDepartment = columnCheck.recordset[0].hasDepartment > 0;
      const hasLocationCode = columnCheck.recordset[0].hasLocationCode > 0;
      
      if (hasDepartment && hasLocationCode) {
        await pool.request()
          .input('id', sql.Int, id)
          .input('locationName', sql.NVarChar(100), location.locationName)
          .input('locationCode', sql.NVarChar(3), location.locationCode)
          .input('department', sql.NVarChar(100), location.department || null)
          .query('UPDATE Locations SET LocationName = @locationName, LocationCode = @locationCode, Department = @department WHERE LocationID = @id');
      } else if (hasDepartment) {
        await pool.request()
          .input('id', sql.Int, id)
          .input('locationName', sql.NVarChar(100), location.locationName)
          .input('department', sql.NVarChar(100), location.department || null)
          .query('UPDATE Locations SET LocationName = @locationName, Department = @department WHERE LocationID = @id');
      } else {
        await pool.request()
          .input('id', sql.Int, id)
          .input('locationName', sql.NVarChar(100), location.locationName)
          .query('UPDATE Locations SET LocationName = @locationName WHERE LocationID = @id');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Locations WHERE LocationID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }
};

module.exports = Location;
