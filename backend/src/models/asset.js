const { poolPromise, sql } = require('../config/database');

const Asset = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT a.*, 
                 l.LocationName, 
                 l.Department as LocationDepartment,
                 c.CompanyName,
                 u1.Username as AssignedToName,
                 u2.Username as CreatedByName,
                 u3.Username as ModifiedByName
          FROM Assets a 
          LEFT JOIN Locations l ON a.LocationID = l.LocationID
          LEFT JOIN Companies c ON a.CompanyID = c.CompanyID
          LEFT JOIN Users u1 ON a.AssignedTo = u1.UserID
          LEFT JOIN Users u2 ON a.CreatedBy = u2.UserID
          LEFT JOIN Users u3 ON a.ModifiedBy = u3.UserID
          ORDER BY a.CreatedAt DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.NVarChar(50), id)
        .query(`
          SELECT a.*, 
                 l.LocationName, 
                 l.Department as LocationDepartment,
                 c.CompanyName,
                 u1.Username as AssignedToName,
                 u2.Username as CreatedByName,
                 u3.Username as ModifiedByName
          FROM Assets a 
          LEFT JOIN Locations l ON a.LocationID = l.LocationID
          LEFT JOIN Companies c ON a.CompanyID = c.CompanyID
          LEFT JOIN Users u1 ON a.AssignedTo = u1.UserID
          LEFT JOIN Users u2 ON a.CreatedBy = u2.UserID
          LEFT JOIN Users u3 ON a.ModifiedBy = u3.UserID
          WHERE a.AssetID = @id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching asset:', error);
      throw error;
    }
  },
  
  create: async (asset) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('assetId', sql.NVarChar(50), asset.assetId)
        .input('mainCategory', sql.NVarChar(100), asset.mainCategory || 'Computer')
        .input('status', sql.NVarChar(50), asset.status || 'Available')
        .input('category', sql.NVarChar(100), asset.category || null)
        .input('modelName', sql.NVarChar(200), asset.modelName || null)
        .input('brand', sql.NVarChar(100), asset.brand || null)
        .input('model', sql.NVarChar(200), asset.model || null)
        .input('cpu', sql.NVarChar(100), asset.cpu || null)
        .input('ram', sql.NVarChar(50), asset.ram || null)
        .input('hdd', sql.NVarChar(50), asset.hdd || null)
        .input('wlanMacAddress', sql.NVarChar(50), asset.wlanMacAddress || null)
        .input('lanMacAddress', sql.NVarChar(50), asset.lanMacAddress || null)
        .input('serialNumber', sql.NVarChar(100), asset.serialNumber || null)
        .input('snType', sql.NVarChar(50), asset.snType || null)
        .input('department', sql.NVarChar(100), asset.department || null)
        .input('datePurchase', sql.DateTime, asset.datePurchase || null)
        .input('dateFirstUse', sql.DateTime, asset.dateFirstUse || null)
        .input('price', sql.Decimal(18, 2), asset.price || 0)
        .input('poNumber', sql.NVarChar(100), asset.poNumber || null)
        .input('computerName', sql.NVarChar(100), asset.computerName || null)
        .input('accessories', sql.NVarChar(500), asset.accessories || null)
        .input('description', sql.NVarChar(sql.MAX), asset.description || null)
        .input('comment', sql.NVarChar(sql.MAX), asset.comment || null)
        .input('replacementCost', sql.Decimal(18, 2), asset.replacementCost || null)
        .input('locationId', sql.Int, asset.locationId)
        .input('companyId', sql.Int, asset.companyId || null)
        .input('createdBy', sql.Int, asset.createdBy || null)
        .input('modifiedBy', sql.Int, asset.modifiedBy || null)
        .query(`
          INSERT INTO Assets 
          (AssetID, MainCategory, Status, Category, ModelName, Brand, Model, CPU, Ram, HDD, 
           WLANMACAddress, LANMACAddress, SerialNumber, SNType, Department, DatePurchase, DateFirstUse, 
           Price, PONumber, ComputerName, Accessories, Description, Comment, ReplacementCost,
           LocationID, CompanyID, CreatedBy, ModifiedBy) 
          VALUES 
          (@assetId, @mainCategory, @status, @category, @modelName, @brand, @model, @cpu, @ram, @hdd,
           @wlanMacAddress, @lanMacAddress, @serialNumber, @snType, @department, @datePurchase, @dateFirstUse,
           @price, @poNumber, @computerName, @accessories, @description, @comment, @replacementCost,
           @locationId, @companyId, @createdBy, @modifiedBy)
        `);
      return { success: true };
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  },
  
  update: async (id, asset) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.NVarChar(50), id)
        .input('mainCategory', sql.NVarChar(100), asset.mainCategory)
        .input('status', sql.NVarChar(50), asset.status)
        .input('category', sql.NVarChar(100), asset.category)
        .input('modelName', sql.NVarChar(200), asset.modelName)
        .input('brand', sql.NVarChar(100), asset.brand)
        .input('model', sql.NVarChar(200), asset.model)
        .input('cpu', sql.NVarChar(100), asset.cpu)
        .input('ram', sql.NVarChar(50), asset.ram)
        .input('hdd', sql.NVarChar(50), asset.hdd)
        .input('serialNumber', sql.NVarChar(100), asset.serialNumber)
        .input('department', sql.NVarChar(100), asset.department)
        .input('datePurchase', sql.DateTime, asset.datePurchase || asset.purchaseDate)
        .input('dateFirstUse', sql.DateTime, asset.dateFirstUse || asset.datePurchase || asset.purchaseDate)
        .input('price', sql.Decimal(18, 2), asset.price || asset.purchasePrice)
        .input('locationId', sql.Int, asset.locationId)
        .input('companyId', sql.Int, asset.companyId)
        .input('modifiedBy', sql.Int, asset.modifiedBy || null)
        .query(`
          UPDATE Assets 
          SET MainCategory = @mainCategory, Status = @status, Category = @category,
              ModelName = @modelName, Brand = @brand, Model = @model,
              CPU = @cpu, Ram = @ram, HDD = @hdd, SerialNumber = @serialNumber,
              Department = @department, DatePurchase = @datePurchase, DateFirstUse = @dateFirstUse,
              Price = @price, LocationID = @locationId, CompanyID = @companyId,
              ModifiedBy = @modifiedBy, UpdatedAt = GETDATE()
          WHERE AssetID = @id
        `);
      return { success: true };
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.NVarChar(50), id)
        .query('DELETE FROM Assets WHERE AssetID = @id');
      return { success: true };
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  },
  
  getByLocation: async (locationId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('locationId', sql.Int, locationId)
        .query('SELECT * FROM Assets WHERE LocationID = @locationId');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching assets by location:', error);
      throw error;
    }
  },
  
  getOldAssets: async (years) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('years', sql.Int, years)
        .query(`
          SELECT a.*, l.LocationName, l.Department 
          FROM Assets a 
          LEFT JOIN Locations l ON a.LocationID = l.LocationID
          WHERE a.DatePurchase < DATEADD(YEAR, -@years, GETDATE())
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching old assets:', error);
      throw error;
    }
  }
};

module.exports = Asset;
