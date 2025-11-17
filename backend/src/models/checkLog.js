const { poolPromise, sql } = require('../config/database');

const CheckLog = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT cl.*, a.AssetName, u.Name as UserName, l.LocationName 
          FROM CheckLogs cl
          JOIN Assets a ON cl.AssetID = a.AssetID
          JOIN Users u ON cl.UserID = u.UserID
          JOIN Locations l ON cl.LocationID = l.LocationID
          ORDER BY cl.Timestamp DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching check logs:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT cl.*, a.AssetName, u.Name as UserName, l.LocationName 
          FROM CheckLogs cl
          JOIN Assets a ON cl.AssetID = a.AssetID
          JOIN Users u ON cl.UserID = u.UserID
          JOIN Locations l ON cl.LocationID = l.LocationID
          WHERE cl.LogID = @id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching check log:', error);
      throw error;
    }
  },
  
  create: async (log) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('assetId', sql.NVarChar(50), log.assetId)
        .input('userId', sql.Int, log.userId)
        .input('locationId', sql.Int, log.locationId)
        .input('actionType', sql.NVarChar(20), log.actionType)
        .input('notes', sql.NVarChar(500), log.notes)
        .query(`
          INSERT INTO CheckLogs (AssetID, UserID, LocationID, ActionType, Notes) 
          VALUES (@assetId, @userId, @locationId, @actionType, @notes);
          SELECT SCOPE_IDENTITY() AS id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating check log:', error);
      throw error;
    }
  },
  
  getByAsset: async (assetId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('assetId', sql.NVarChar(50), assetId)
        .query(`
          SELECT cl.*, u.Name as UserName, l.LocationName 
          FROM CheckLogs cl
          JOIN Users u ON cl.UserID = u.UserID
          JOIN Locations l ON cl.LocationID = l.LocationID
          WHERE cl.AssetID = @assetId
          ORDER BY cl.Timestamp DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching check logs by asset:', error);
      throw error;
    }
  },
  
  getByLocation: async (locationId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('locationId', sql.Int, locationId)
        .query(`
          SELECT cl.*, a.AssetName, u.Name as UserName 
          FROM CheckLogs cl
          JOIN Assets a ON cl.AssetID = a.AssetID
          JOIN Users u ON cl.UserID = u.UserID
          WHERE cl.LocationID = @locationId
          ORDER BY cl.Timestamp DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching check logs by location:', error);
      throw error;
    }
  }
};

module.exports = CheckLog;
