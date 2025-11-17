const { spfi } = require('@pnp/sp');
require('@pnp/sp/webs');
require('@pnp/sp/lists');
require('@pnp/sp/items');
require('@pnp/sp/batching');
const { SPDefault } = require('@pnp/nodejs');
const { poolPromise, sql } = require('../config/database');

/**
 * SharePoint Service using PnPjs
 * Modern, clean API for SharePoint operations
 */
class SharePointServicePnP {
  constructor() {
    // SharePoint configuration
    this.siteUrl = process.env.SHAREPOINT_SITE_URL || 'https://rmaadminrmagroup.sharepoint.com/sites/Intranet/rmalaos/IT';
    this.listName = process.env.SHAREPOINT_LIST_NAME || 'IT Asset DB';
    this.listId = process.env.SHAREPOINT_LIST_ID; // Optional: List GUID
    this.username = process.env.SHAREPOINT_USERNAME;
    this.password = process.env.SHAREPOINT_PASSWORD;
    
    // Check if credentials are provided
    // Note: PnP v4 doesn't support username/password auth, using mock mode
    this.mockMode = true; // Force mock mode for now
    
    // Initialize PnP SP instance
    this.spInstance = null;
    
    if (this.mockMode) {
      console.log('⚠️  SharePoint Service (PnPjs) running in MOCK MODE');
    } else {
      console.log('✓ SharePoint Service (PnPjs) configured with USERNAME/PASSWORD');
      console.log(`  Site: ${this.siteUrl}`);
      console.log(`  List: ${this.listId ? `ID: ${this.listId}` : `Name: ${this.listName}`}`);
      console.log(`  User: ${this.username}`);
      this.initializePnP();
    }
  }

  /**
   * Initialize PnP SP with authentication
   * Note: PnP v4 requires MSAL authentication, not username/password
   */
  async initializePnP() {
    // Mock mode enabled - PnP v4 doesn't support username/password auth
    console.log('ℹ️  Using mock mode - PnP v4 requires MSAL authentication');
  }

  /**
   * Generate mock SharePoint data for testing
   */
  generateMockSharePointData() {
    return [
      {
        Id: 1,
        Title: 'MOCK-SP-001',
        AssetID: 'MOCK-SP-001',
        MainCategory: 'Workstation',
        Status: 'Available',
        Brand: 'Lenovo',
        ModelName: 'ThinkPad X1',
        SerialNumber: 'SP123456',
        Department: 'IT',
        Modified: new Date().toISOString()
      },
      {
        Id: 2,
        Title: 'MOCK-SP-002',
        AssetID: 'MOCK-SP-002',
        MainCategory: 'Display',
        Status: 'Assigned',
        Brand: 'Dell',
        ModelName: 'UltraSharp 27',
        SerialNumber: 'SP789012',
        Department: 'Sales',
        Modified: new Date().toISOString()
      },
      {
        Id: 3,
        Title: 'MOCK-SP-003',
        AssetID: 'MOCK-SP-003',
        MainCategory: 'Printer',
        Status: 'Available',
        Brand: 'HP',
        ModelName: 'LaserJet Pro',
        SerialNumber: 'SP345678',
        Department: 'Administration',
        Modified: new Date().toISOString()
      }
    ];
  }

  /**
   * Get the SharePoint list (by ID or Title)
   */
  getList() {
    if (this.listId) {
      // Use List ID (GUID) - more reliable
      console.log(`Using List ID: ${this.listId}`);
      return this.spInstance.web.lists.getById(this.listId);
    } else {
      // Use List Title (Name)
      console.log(`Using List Title: ${this.listName}`);
      return this.spInstance.web.lists.getByTitle(this.listName);
    }
  }

  /**
   * Get items from SharePoint list
   */
  async getSharePointItems(filter = null) {
    // Mock mode
    if (this.mockMode) {
      console.log('📋 PnPjs Mock Mode: Returning simulated data');
      return this.generateMockSharePointData();
    }

    try {
      // Ensure PnP is initialized
      if (!this.spInstance) {
        await this.initializePnP();
      }

      // Get list (by ID or Title)
      const list = this.getList();
      
      // Build query
      let query = list.items.select(
        'Id', 'Title', 'AssetID', 'MainCategory', 'SubCategory',
        'Brand', 'ModelName', 'Model', 'SerialNumber', 'Status',
        'Department', 'CPU', 'RAM', 'HDD', 'DatePurchase', 'DateFirstUse',
        'Price', 'LocationID', 'CompanyID', 'Modified'
      ).top(5000);

      // Apply filter if provided
      if (filter) {
        query = query.filter(filter);
      }

      // Execute query
      const items = await query();
      
      console.log(`✓ PnPjs: Retrieved ${items.length} items from SharePoint`);
      return items;
    } catch (error) {
      console.error('PnPjs Error getting items:', error.message);
      throw new Error(`Failed to get SharePoint items: ${error.message}`);
    }
  }

  /**
   * Get single item by ID
   */
  async getItemById(itemId) {
    if (this.mockMode) {
      const mockData = this.generateMockSharePointData();
      return mockData.find(item => item.Id === itemId);
    }

    try {
      if (!this.spInstance) {
        await this.initializePnP();
      }

      const list = this.getList();
      const item = await list.items.getById(itemId)();
      
      return item;
    } catch (error) {
      console.error('PnPjs Error getting item by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create new item in SharePoint
   */
  async createItem(data) {
    if (this.mockMode) {
      console.log('📋 PnPjs Mock Mode: Simulating item creation');
      return { Id: Math.floor(Math.random() * 1000), ...data };
    }

    try {
      if (!this.spInstance) {
        await this.initializePnP();
      }

      const list = this.getList();
      const result = await list.items.add(data);
      
      console.log(`✓ PnPjs: Created item with ID ${result.data.Id}`);
      return result.data;
    } catch (error) {
      console.error('PnPjs Error creating item:', error.message);
      throw error;
    }
  }

  /**
   * Update item in SharePoint
   */
  async updateItem(itemId, data) {
    if (this.mockMode) {
      console.log('📋 PnPjs Mock Mode: Simulating item update');
      return { Id: itemId, ...data };
    }

    try {
      if (!this.spInstance) {
        await this.initializePnP();
      }

      const list = this.getList();
      await list.items.getById(itemId).update(data);
      
      console.log(`✓ PnPjs: Updated item with ID ${itemId}`);
      return { Id: itemId, ...data };
    } catch (error) {
      console.error('PnPjs Error updating item:', error.message);
      throw error;
    }
  }

  /**
   * Delete item from SharePoint
   */
  async deleteItem(itemId) {
    if (this.mockMode) {
      console.log('📋 PnPjs Mock Mode: Simulating item deletion');
      return { success: true };
    }

    try {
      if (!this.spInstance) {
        await this.initializePnP();
      }

      const list = this.getList();
      await list.items.getById(itemId).delete();
      
      console.log(`✓ PnPjs: Deleted item with ID ${itemId}`);
      return { success: true };
    } catch (error) {
      console.error('PnPjs Error deleting item:', error.message);
      throw error;
    }
  }

  /**
   * Test SharePoint connection
   */
  async testConnection() {
    console.log('Testing SharePoint connection with PnPjs...');
    
    const result = {
      success: false,
      message: '',
      mockMode: this.mockMode,
      method: 'PnPjs',
      details: {
        siteUrl: this.siteUrl,
        listName: this.listName,
        authenticated: false,
        listAccessible: false,
        itemCount: 0,
        sampleItems: []
      }
    };

    try {
      if (this.mockMode) {
        // Mock mode
        console.log('📋 PnPjs Mock Mode: Simulating connection');
        result.details.authenticated = true;
        result.details.listAccessible = true;
        
        const items = this.generateMockSharePointData();
        result.details.itemCount = items.length;
        result.details.sampleItems = items.map(item => ({
          Id: item.Id,
          Title: item.Title,
          AssetID: item.AssetID,
          MainCategory: item.MainCategory,
          Status: item.Status,
          Modified: item.Modified
        }));

        result.success = true;
        result.message = `✓ MOCK MODE (PnPjs): Simulated connection successful. Found ${items.length} mock items`;
        
        console.log('✓ PnPjs Mock connection test completed');
        return result;
      }

      // Real connection
      console.log('Step 1: Initializing PnPjs...');
      if (!this.spInstance) {
        await this.initializePnP();
      }
      result.details.authenticated = true;
      console.log('✓ PnPjs initialized');

      // Test list access
      console.log('Step 2: Testing list access...');
      const items = await this.getSharePointItems();
      result.details.listAccessible = true;
      result.details.itemCount = items.length;
      console.log(`✓ List accessible, found ${items.length} items`);

      // Get sample items
      result.details.sampleItems = items.slice(0, 5).map(item => ({
        Id: item.Id,
        Title: item.Title || item.AssetID,
        AssetID: item.AssetID || item.Title,
        MainCategory: item.MainCategory,
        Status: item.Status,
        Modified: item.Modified
      }));

      result.success = true;
      result.message = `✓ Successfully connected to SharePoint using PnPjs. Found ${items.length} items in list "${this.listName}"`;
      
      console.log('✓ PnPjs Connection test completed successfully');
      return result;
    } catch (error) {
      console.error('✗ PnPjs Connection test failed:', error.message);
      result.success = false;
      result.message = `Connection failed: ${error.message}`;
      result.error = error.message;
      return result;
    }
  }

  /**
   * Sync from SharePoint to Database
   */
  async syncFromSharePoint() {
    console.log('Starting PnPjs sync from SharePoint to Database...');
    
    const results = {
      total: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    try {
      // Get SharePoint items
      const spItems = await this.getSharePointItems();
      results.total = spItems.length;
      console.log(`Found ${spItems.length} items to sync`);

      const pool = await poolPromise;

      for (const spItem of spItems) {
        try {
          const assetId = spItem.AssetID || spItem.Title;
          
          if (!assetId) {
            results.skipped++;
            continue;
          }

          // Check if asset exists
          const checkResult = await pool.request()
            .input('assetId', sql.NVarChar(50), assetId)
            .query('SELECT COUNT(*) as count FROM Assets WHERE AssetID = @assetId');
          
          const exists = checkResult.recordset[0].count > 0;

          // Prepare asset data
          const assetData = {
            assetId: assetId,
            mainCategory: spItem.MainCategory,
            subCategory: spItem.SubCategory,
            brand: spItem.Brand,
            modelName: spItem.ModelName || spItem.Model,
            serialNumber: spItem.SerialNumber,
            status: spItem.Status || 'Available',
            department: spItem.Department,
            cpu: spItem.CPU,
            ram: spItem.RAM,
            hdd: spItem.HDD,
            datePurchase: spItem.DatePurchase ? new Date(spItem.DatePurchase) : null,
            dateFirstUse: spItem.DateFirstUse ? new Date(spItem.DateFirstUse) : null,
            price: parseFloat(spItem.Price) || 0,
            locationId: spItem.LocationID || null,
            companyId: spItem.CompanyID || null
          };

          if (exists) {
            // Update existing asset
            await pool.request()
              .input('assetId', sql.NVarChar(50), assetData.assetId)
              .input('mainCategory', sql.NVarChar(100), assetData.mainCategory)
              .input('subCategory', sql.NVarChar(100), assetData.subCategory)
              .input('brand', sql.NVarChar(100), assetData.brand)
              .input('modelName', sql.NVarChar(200), assetData.modelName)
              .input('serialNumber', sql.NVarChar(100), assetData.serialNumber)
              .input('status', sql.NVarChar(50), assetData.status)
              .input('department', sql.NVarChar(100), assetData.department)
              .input('cpu', sql.NVarChar(100), assetData.cpu)
              .input('ram', sql.NVarChar(50), assetData.ram)
              .input('hdd', sql.NVarChar(50), assetData.hdd)
              .input('datePurchase', sql.DateTime, assetData.datePurchase)
              .input('dateFirstUse', sql.DateTime, assetData.dateFirstUse)
              .input('price', sql.Decimal(18, 2), assetData.price)
              .input('locationId', sql.Int, assetData.locationId)
              .input('companyId', sql.Int, assetData.companyId)
              .query(`
                UPDATE Assets SET
                  MainCategory = @mainCategory,
                  SubCategory = @subCategory,
                  Brand = @brand,
                  ModelName = @modelName,
                  SerialNumber = @serialNumber,
                  Status = @status,
                  Department = @department,
                  CPU = @cpu,
                  Ram = @ram,
                  HDD = @hdd,
                  DatePurchase = @datePurchase,
                  DateFirstUse = @dateFirstUse,
                  Price = @price,
                  LocationID = @locationId,
                  CompanyID = @companyId,
                  UpdatedAt = GETDATE()
                WHERE AssetID = @assetId
              `);
            
            results.updated++;
          } else {
            // Insert new asset
            await pool.request()
              .input('assetId', sql.NVarChar(50), assetData.assetId)
              .input('mainCategory', sql.NVarChar(100), assetData.mainCategory)
              .input('subCategory', sql.NVarChar(100), assetData.subCategory)
              .input('brand', sql.NVarChar(100), assetData.brand)
              .input('modelName', sql.NVarChar(200), assetData.modelName)
              .input('serialNumber', sql.NVarChar(100), assetData.serialNumber)
              .input('status', sql.NVarChar(50), assetData.status)
              .input('department', sql.NVarChar(100), assetData.department)
              .input('cpu', sql.NVarChar(100), assetData.cpu)
              .input('ram', sql.NVarChar(50), assetData.ram)
              .input('hdd', sql.NVarChar(50), assetData.hdd)
              .input('datePurchase', sql.DateTime, assetData.datePurchase)
              .input('dateFirstUse', sql.DateTime, assetData.dateFirstUse)
              .input('price', sql.Decimal(18, 2), assetData.price)
              .input('locationId', sql.Int, assetData.locationId)
              .input('companyId', sql.Int, assetData.companyId)
              .query(`
                INSERT INTO Assets (
                  AssetID, MainCategory, SubCategory, Brand, ModelName,
                  SerialNumber, Status, Department, CPU, Ram, HDD,
                  DatePurchase, DateFirstUse, Price, LocationID, CompanyID,
                  CreatedAt, UpdatedAt
                ) VALUES (
                  @assetId, @mainCategory, @subCategory, @brand, @modelName,
                  @serialNumber, @status, @department, @cpu, @ram, @hdd,
                  @datePurchase, @dateFirstUse, @price, @locationId, @companyId,
                  GETDATE(), GETDATE()
                )
              `);
            
            results.inserted++;
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            assetId: spItem.AssetID || spItem.Title,
            error: error.message
          });
        }
      }

      console.log('PnPjs Sync completed:', results);
      return results;
    } catch (error) {
      console.error('Error in PnPjs syncFromSharePoint:', error);
      throw error;
    }
  }

  /**
   * Compare data between SharePoint and Database
   */
  async compareData() {
    console.log('Comparing data using PnPjs...');
    
    const comparison = {
      sharepoint: { total: 0, items: [] },
      database: { total: 0, items: [] },
      matching: { count: 0, items: [] },
      onlyInSharePoint: { count: 0, items: [] },
      onlyInDatabase: { count: 0, items: [] },
      conflicts: { count: 0, items: [] }
    };

    try {
      // Get SharePoint items
      const spItems = await this.getSharePointItems();
      comparison.sharepoint.total = spItems.length;
      comparison.sharepoint.items = spItems.map(item => ({
        Id: item.Id,
        AssetID: item.AssetID || item.Title,
        MainCategory: item.MainCategory,
        Status: item.Status,
        Brand: item.Brand,
        Modified: item.Modified
      }));

      // Get Database items
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Assets');
      const dbAssets = result.recordset;
      comparison.database.total = dbAssets.length;
      comparison.database.items = dbAssets.map(asset => ({
        AssetID: asset.AssetID,
        MainCategory: asset.MainCategory,
        Status: asset.Status,
        Brand: asset.Brand,
        UpdatedAt: asset.UpdatedAt
      }));

      // Create maps for comparison
      const spMap = new Map();
      spItems.forEach(item => {
        const assetId = item.AssetID || item.Title;
        spMap.set(assetId, item);
      });

      const dbMap = new Map();
      dbAssets.forEach(asset => {
        dbMap.set(asset.AssetID, asset);
      });

      // Compare
      dbAssets.forEach(asset => {
        const assetId = asset.AssetID;
        if (spMap.has(assetId)) {
          const spItem = spMap.get(assetId);
          
          const hasConflict = 
            (spItem.MainCategory && spItem.MainCategory !== asset.MainCategory) ||
            (spItem.Status && spItem.Status !== asset.Status);

          if (hasConflict) {
            comparison.conflicts.items.push({
              AssetID: assetId,
              sharepoint: {
                MainCategory: spItem.MainCategory,
                Status: spItem.Status,
                Modified: spItem.Modified
              },
              database: {
                MainCategory: asset.MainCategory,
                Status: asset.Status,
                UpdatedAt: asset.UpdatedAt
              }
            });
          } else {
            comparison.matching.items.push({ AssetID: assetId });
          }
        } else {
          comparison.onlyInDatabase.items.push({
            AssetID: assetId,
            MainCategory: asset.MainCategory,
            Status: asset.Status
          });
        }
      });

      // Find items only in SharePoint
      spItems.forEach(item => {
        const assetId = item.AssetID || item.Title;
        if (!dbMap.has(assetId)) {
          comparison.onlyInSharePoint.items.push({
            Id: item.Id,
            AssetID: assetId,
            MainCategory: item.MainCategory,
            Status: item.Status
          });
        }
      });

      // Update counts
      comparison.matching.count = comparison.matching.items.length;
      comparison.onlyInSharePoint.count = comparison.onlyInSharePoint.items.length;
      comparison.onlyInDatabase.count = comparison.onlyInDatabase.items.length;
      comparison.conflicts.count = comparison.conflicts.items.length;

      console.log('PnPjs Comparison completed');
      return comparison;
    } catch (error) {
      console.error('Error in PnPjs compareData:', error);
      throw error;
    }
  }
}

module.exports = new SharePointServicePnP();
