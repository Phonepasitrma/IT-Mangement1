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
                 pr.PRNumber,
                 u1.Name as CreatedByName,
                 u2.Name as ModifiedByName
          FROM Assets a 
          LEFT JOIN Locations l ON a.LocationID = l.LocationID
          LEFT JOIN Companies c ON a.CompanyID = c.CompanyID
          LEFT JOIN PRNumbers pr ON a.PRID = pr.PRID
          LEFT JOIN Users u1 ON a.CreatedBy = u1.UserID
          LEFT JOIN Users u2 ON a.ModifiedBy = u2.UserID
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
                 pr.PRNumber,
                 u1.Name as CreatedByName,
                 u2.Name as ModifiedByName
          FROM Assets a 
          LEFT JOIN Locations l ON a.LocationID = l.LocationID
          LEFT JOIN Companies c ON a.CompanyID = c.CompanyID
          LEFT JOIN PRNumbers pr ON a.PRID = pr.PRID
          LEFT JOIN Users u1 ON a.CreatedBy = u1.UserID
          LEFT JOIN Users u2 ON a.ModifiedBy = u2.UserID
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
      const result = await pool.request()
        .input('assetId', sql.NVarChar(50), asset.assetId)
        .input('picture', sql.NVarChar(sql.MAX), asset.picture || null)
        .input('mainCategory', sql.NVarChar(100), asset.mainCategory || null)
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
        .input('description', sql.NVarChar(sql.MAX), asset.description || null)
        .input('userName', sql.NVarChar(100), asset.userName || null)
        .input('department', sql.NVarChar(100), asset.department || null)
        .input('datePurchase', sql.DateTime, asset.datePurchase || null)
        .input('dateFirstUse', sql.DateTime, asset.dateFirstUse || null)
        .input('serialNumber', sql.NVarChar(100), asset.serialNumber || null)
        .input('snType', sql.NVarChar(50), asset.snType || null)
        .input('prId', sql.Int, asset.prId || null)
        .input('poNumber', sql.NVarChar(50), asset.poNumber || null)
        .input('price', sql.Decimal(18, 2), asset.price || null)
        .input('invoice', sql.NVarChar(sql.MAX), asset.invoice || null)
        .input('deliveryNote', sql.NVarChar(sql.MAX), asset.deliveryNote || null)
        .input('computerName', sql.NVarChar(100), asset.computerName || null)
        .input('companyId', sql.Int, asset.companyId || null)
        .input('locationId', sql.Int, asset.locationId || null)
        .input('accessories', sql.NVarChar(500), asset.accessories || null)
        .input('comment', sql.NVarChar(sql.MAX), asset.comment || null)
        .input('supplierWarrantyType', sql.NVarChar(100), asset.supplierWarrantyType || null)
        .input('supplierWarrantyScope', sql.NVarChar(100), asset.supplierWarrantyScope || null)
        .input('supplierWarrantyServiceMethod', sql.NVarChar(100), asset.supplierWarrantyServiceMethod || null)
        .input('supplierWarrantyStart', sql.DateTime, asset.supplierWarrantyStart || null)
        .input('supplierWarrantyEnd', sql.DateTime, asset.supplierWarrantyEnd || null)
        .input('replacementCost', sql.Decimal(18, 2), asset.replacementCost || null)
        .input('additionalWarranty', sql.NVarChar(100), asset.additionalWarranty || null)
        .input('additionalWarrantyCompany', sql.NVarChar(200), asset.additionalWarrantyCompany || null)
        .input('additionalWarrantyType', sql.NVarChar(100), asset.additionalWarrantyType || null)
        .input('additionalWarrantyScope', sql.NVarChar(100), asset.additionalWarrantyScope || null)
        .input('additionalWarrantyServiceMethod', sql.NVarChar(100), asset.additionalWarrantyServiceMethod || null)
        .input('additionalWarrantyStart', sql.DateTime, asset.additionalWarrantyStart || null)
        .input('additionalWarrantyEnd', sql.DateTime, asset.additionalWarrantyEnd || null)
        .input('testNumber', sql.NVarChar(50), asset.testNumber || null)
        .input('createdBy', sql.Int, asset.createdBy || 1)
        .input('modifiedBy', sql.Int, asset.modifiedBy || 1)
        .query(`
          INSERT INTO Assets (
            AssetID, Picture, MainCategory, Status, Category, ModelName, Brand, Model,
            CPU, Ram, HDD, WLANMACAddress, LANMACAddress, Description, UserName, Department,
            DatePurchase, DateFirstUse, SerialNumber, SNType, PRID, PONumber, Price,
            Invoice, DeliveryNote, ComputerName, CompanyID, LocationID, Accessories, Comment,
            SupplierWarrantyType, SupplierWarrantyScope, SupplierWarrantyServiceMethod,
            SupplierWarrantyStart, SupplierWarrantyEnd, ReplacementCost,
            AdditionalWarranty, AdditionalWarrantyCompany, AdditionalWarrantyType,
            AdditionalWarrantyScope, AdditionalWarrantyServiceMethod,
            AdditionalWarrantyStart, AdditionalWarrantyEnd, TestNumber,
            CreatedBy, ModifiedBy
          ) VALUES (
            @assetId, @picture, @mainCategory, @status, @category, @modelName, @brand, @model,
            @cpu, @ram, @hdd, @wlanMacAddress, @lanMacAddress, @description, @userName, @department,
            @datePurchase, @dateFirstUse, @serialNumber, @snType, @prId, @poNumber, @price,
            @invoice, @deliveryNote, @computerName, @companyId, @locationId, @accessories, @comment,
            @supplierWarrantyType, @supplierWarrantyScope, @supplierWarrantyServiceMethod,
            @supplierWarrantyStart, @supplierWarrantyEnd, @replacementCost,
            @additionalWarranty, @additionalWarrantyCompany, @additionalWarrantyType,
            @additionalWarrantyScope, @additionalWarrantyServiceMethod,
            @additionalWarrantyStart, @additionalWarrantyEnd, @testNumber,
            @createdBy, @modifiedBy
          )
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
        .input('picture', sql.NVarChar(sql.MAX), asset.picture)
        .input('mainCategory', sql.NVarChar(100), asset.mainCategory)
        .input('status', sql.NVarChar(50), asset.status)
        .input('category', sql.NVarChar(100), asset.category)
        .input('modelName', sql.NVarChar(200), asset.modelName)
        .input('brand', sql.NVarChar(100), asset.brand)
        .input('model', sql.NVarChar(200), asset.model)
        .input('cpu', sql.NVarChar(100), asset.cpu)
        .input('ram', sql.NVarChar(50), asset.ram)
        .input('hdd', sql.NVarChar(50), asset.hdd)
        .input('wlanMacAddress', sql.NVarChar(50), asset.wlanMacAddress)
        .input('lanMacAddress', sql.NVarChar(50), asset.lanMacAddress)
        .input('description', sql.NVarChar(sql.MAX), asset.description)
        .input('userName', sql.NVarChar(100), asset.userName)
        .input('department', sql.NVarChar(100), asset.department)
        .input('datePurchase', sql.DateTime, asset.datePurchase)
        .input('dateFirstUse', sql.DateTime, asset.dateFirstUse)
        .input('serialNumber', sql.NVarChar(100), asset.serialNumber)
        .input('snType', sql.NVarChar(50), asset.snType)
        .input('prId', sql.Int, asset.prId)
        .input('poNumber', sql.NVarChar(50), asset.poNumber)
        .input('price', sql.Decimal(18, 2), asset.price)
        .input('invoice', sql.NVarChar(sql.MAX), asset.invoice)
        .input('deliveryNote', sql.NVarChar(sql.MAX), asset.deliveryNote)
        .input('computerName', sql.NVarChar(100), asset.computerName)
        .input('companyId', sql.Int, asset.companyId)
        .input('locationId', sql.Int, asset.locationId)
        .input('accessories', sql.NVarChar(500), asset.accessories)
        .input('comment', sql.NVarChar(sql.MAX), asset.comment)
        .input('supplierWarrantyType', sql.NVarChar(100), asset.supplierWarrantyType)
        .input('supplierWarrantyScope', sql.NVarChar(100), asset.supplierWarrantyScope)
        .input('supplierWarrantyServiceMethod', sql.NVarChar(100), asset.supplierWarrantyServiceMethod)
        .input('supplierWarrantyStart', sql.DateTime, asset.supplierWarrantyStart)
        .input('supplierWarrantyEnd', sql.DateTime, asset.supplierWarrantyEnd)
        .input('replacementCost', sql.Decimal(18, 2), asset.replacementCost)
        .input('additionalWarranty', sql.NVarChar(100), asset.additionalWarranty)
        .input('additionalWarrantyCompany', sql.NVarChar(200), asset.additionalWarrantyCompany)
        .input('additionalWarrantyType', sql.NVarChar(100), asset.additionalWarrantyType)
        .input('additionalWarrantyScope', sql.NVarChar(100), asset.additionalWarrantyScope)
        .input('additionalWarrantyServiceMethod', sql.NVarChar(100), asset.additionalWarrantyServiceMethod)
        .input('additionalWarrantyStart', sql.DateTime, asset.additionalWarrantyStart)
        .input('additionalWarrantyEnd', sql.DateTime, asset.additionalWarrantyEnd)
        .input('testNumber', sql.NVarChar(50), asset.testNumber)
        .input('modifiedBy', sql.Int, asset.modifiedBy || 1)
        .query(`
          UPDATE Assets SET
            Picture = @picture, MainCategory = @mainCategory, Status = @status,
            Category = @category, ModelName = @modelName, Brand = @brand, Model = @model,
            CPU = @cpu, Ram = @ram, HDD = @hdd, WLANMACAddress = @wlanMacAddress,
            LANMACAddress = @lanMacAddress, Description = @description, UserName = @userName,
            Department = @department, DatePurchase = @datePurchase, DateFirstUse = @dateFirstUse,
            SerialNumber = @serialNumber, SNType = @snType, PRID = @prId, PONumber = @poNumber,
            Price = @price, Invoice = @invoice, DeliveryNote = @deliveryNote,
            ComputerName = @computerName, CompanyID = @companyId, LocationID = @locationId,
            Accessories = @accessories, Comment = @comment,
            SupplierWarrantyType = @supplierWarrantyType, SupplierWarrantyScope = @supplierWarrantyScope,
            SupplierWarrantyServiceMethod = @supplierWarrantyServiceMethod,
            SupplierWarrantyStart = @supplierWarrantyStart, SupplierWarrantyEnd = @supplierWarrantyEnd,
            ReplacementCost = @replacementCost, AdditionalWarranty = @additionalWarranty,
            AdditionalWarrantyCompany = @additionalWarrantyCompany,
            AdditionalWarrantyType = @additionalWarrantyType,
            AdditionalWarrantyScope = @additionalWarrantyScope,
            AdditionalWarrantyServiceMethod = @additionalWarrantyServiceMethod,
            AdditionalWarrantyStart = @additionalWarrantyStart,
            AdditionalWarrantyEnd = @additionalWarrantyEnd, TestNumber = @testNumber,
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
