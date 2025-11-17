const { poolPromise, sql } = require('../config/database');

const StockCount = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT sc.*, a.AssetName, u.Name as UserName, l.LocationName 
          FROM StockCounts sc
          JOIN Assets a ON sc.AssetID = a.AssetID
          JOIN Users u ON sc.UserID = u.UserID
          JOIN Locations l ON sc.LocationID = l.LocationID
          ORDER BY sc.CountDate DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching stock counts:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT sc.*, a.AssetName, u.Name as UserName, l.LocationName 
          FROM StockCounts sc
          JOIN Assets a ON sc.AssetID = a.AssetID
          JOIN Users u ON sc.UserID = u.UserID
          JOIN Locations l ON sc.LocationID = l.LocationID
          WHERE sc.CountID = @id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching stock count:', error);
      throw error;
    }
  },
  
  create: async (stockCount) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('locationId', sql.Int, stockCount.locationId)
        .input('assetId', sql.NVarChar(50), stockCount.assetId)
        .input('userId', sql.Int, stockCount.userId)
        .input('countDate', sql.Date, stockCount.countDate)
        .input('status', sql.NVarChar(20), stockCount.status)
        .input('notes', sql.NVarChar(500), stockCount.notes)
        .query(`
          INSERT INTO StockCounts (LocationID, AssetID, UserID, CountDate, Status, Notes) 
          VALUES (@locationId, @assetId, @userId, @countDate, @status, @notes);
          SELECT SCOPE_IDENTITY() AS id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating stock count:', error);
      throw error;
    }
  },
  
  getByLocation: async (locationId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('locationId', sql.Int, locationId)
        .query(`
          SELECT sc.*, a.AssetName, u.Name as UserName 
          FROM StockCounts sc
          JOIN Assets a ON sc.AssetID = a.AssetID
          JOIN Users u ON sc.UserID = u.UserID
          WHERE sc.LocationID = @locationId
          ORDER BY sc.CountDate DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching stock counts by location:', error);
      throw error;
    }
  },
  
  getByDate: async (date) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('date', sql.Date, date)
        .query(`
          SELECT sc.*, a.AssetName, u.Name as UserName, l.LocationName 
          FROM StockCounts sc
          JOIN Assets a ON sc.AssetID = a.AssetID
          JOIN Users u ON sc.UserID = u.UserID
          JOIN Locations l ON sc.LocationID = l.LocationID
          WHERE sc.CountDate = @date
          ORDER BY l.LocationName, a.AssetName
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching stock counts by date:', error);
      throw error;
    }
  },
  
  getSummary: async (locationId, date) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('locationId', sql.Int, locationId)
        .input('date', sql.Date, date)
        .query(`
          SELECT 
            Status,
            COUNT(*) as Count
          FROM StockCounts
          WHERE LocationID = @locationId AND CountDate = @date
          GROUP BY Status
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching stock count summary:', error);
      throw error;
    }
  }
};

module.exports = StockCount;
