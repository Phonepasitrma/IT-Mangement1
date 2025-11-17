const axios = require('axios');
const { poolPromise, sql } = require('../config/database');

// Try to load SharePoint authentication libraries
let spauth, sprequest;
try {
  spauth = require('node-sp-auth');
  sprequest = require('sp-request');
} catch (error) {
  console.log('⚠️  SharePoint auth libraries not installed. Run: npm install node-sp-auth sp-request');
}

/**
 * SharePoint Synchronization Service
 * Handles bidirectional sync between SQL Server and SharePoint Lists
 * Supports both username/password and client credentials authentication
 */

class SharePointService {
  constructor() {
    // SharePoint configuration
    this.siteUrl = process.env.SHAREPOINT_SITE_URL || 'https://rmaadminrmagroup.sharepoint.com/sites/Intranet/rmalaos/IT';
    this.listName = process.env.SHAREPOINT_LIST_NAME || 'IT Asset DB';
    
    // Authentication methods
    this.username = process.env.SHAREPOINT_USERNAME;
    this.password = process.env.SHAREPOINT_PASSWORD;
    this.clientId = process.env.SHAREPOINT_CLIENT_ID;
    this.clientSecret = process.env.SHAREPOINT_CLIENT_SECRET;
    this.tenantId = process.env.SHAREPOINT_TENANT_ID;
    
    this.accessToken = null;
    this.tokenExpiry = null;
    this.spr = null; // SharePoint request object for username/password auth
    
    // Determine authentication mode
    this.useUsernamePassword = !!(this.username && this.password && spauth && sprequest);
    this.useClientCredentials = !!(this.clientId && this.clientSecret && this.tenantId);
    this.mockMode = process.env.SHAREPOINT_MOCK_MODE === 'true' || (!this.useUsernamePassword && !this.useClientCredentials);
    
    if (this.mockMode) {
      console.log('⚠️  SharePoint Service running in MOCK MODE (no real SharePoint connection)');
    } else if (this.useUsernamePassword) {
      console.log('✓ SharePoint Service configured with USERNAME/PASSWORD authentication');
      console.log(`  Site: ${this.siteUrl}`);
      console.log(`  List: ${this.listName}`);
      console.log(`  User: ${this.username}`);
    } else if (this.useClientCredentials) {
      console.log('✓ SharePoint Service configured with CLIENT CREDENTIALS authentication');
      console.log(`  Site: ${this.siteUrl}`);
      console.log(`  List: ${this.listName}`);
    }
  }

  /**
   * Generate mock SharePoint data for testing
   */
  generateMockSharePointData() {
    return [
      {
        ID: 1,
        Title: 'MOCK-SP-001',
        AssetID: 'MOCK-SP-001',
        MainCategory: 'Workstation',
        Status: 'Available',
        Category: 'Laptop',
        ModelName: 'ThinkPad X1',
        Brand: 'Lenovo',
        Model: 'X1 Carbon Gen 9',
        CPU: 'Intel Core i7-1165G7',
        RAM: '16GB',
        HDD: '512GB SSD',
        SerialNumber: 'SP123456',
        Department: 'IT',
        DatePurchase: '2024-01-15T00:00:00Z',
        DateFirstUse: '2024-01-20T00:00:00Z',
        Price: 1500,
        LocationID: 1,
        CompanyID: 2,
        Modified: new Date().toISOString()
      },
      {
        ID: 2,
        Title: 'MOCK-SP-002',
        AssetID: 'MOCK-SP-002',
        MainCategory: 'Display',
        Status: 'Assigned',
        Category: 'Monitor',
        ModelName: 'UltraSharp 27',
        Brand: 'Dell',
        Model: 'U2720Q',
        CPU: null,
        RAM: null,
        HDD: null,
        SerialNumber: 'SP789012',
        Department: 'Sales',
        DatePurchase: '2024-02-10T00:00:00Z',
        DateFirstUse: '2024-02-15T00:00:00Z',
        Price: 600,
        LocationID: 1,
        CompanyID: 3,
        Modified: new Date().toISOString()
      },
      {
        ID: 3,
        Title: 'MOCK-SP-003',
        AssetID: 'MOCK-SP-003',
        MainCategory: 'Printer',
        Status: 'Available',
        Category: 'Laser Printer',
        ModelName: 'LaserJet Pro',
        Brand: 'HP',
        Model: 'M404dn',
        CPU: null,
        RAM: null,
        HDD: null,
        SerialNumber: 'SP345678',
        Department: 'Administration',
        DatePurchase: '2024-03-05T00:00:00Z',
        DateFirstUse: '2024-03-10T00:00:00Z',
        Price: 400,
        LocationID: 2,
        CompanyID: 4,
        Modified: new Date().toISOString()
      }
    ];
  }

  /**
   * Get access token for SharePoint API
   */
  async getAccessToken() {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const tokenUrl = `https://accounts.accesscontrol.windows.net/${this.tenantId}/tokens/OAuth/2`;
      
      const response = await axios.post(tokenUrl, new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: `${this.clientId}@${this.tenantId}`,
        client_secret: this.clientSecret,
        resource: `00000003-0000-0ff1-ce00-000000000000/${this.siteUrl.split('/')[2]}@${this.tenantId}`
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting SharePoint access token:', error.message);
      throw new Error('Failed to authenticate with SharePoint');
    }
  }

  /**
   * Initialize SharePoint request object for username/password auth
   */
  async initializeSharePointRequest() {
    if (!this.spr && this.useUsernamePassword) {
      try {
        const credentials = {
          username: this.username,
          password: this.password
        };
        
        const authHeaders = await spauth.getAuth(this.siteUrl, credentials);
        this.spr = sprequest.create(authHeaders);
        console.log('✓ SharePoint request initialized');
      } catch (error) {
        console.error('Error initializing SharePoint request:', error.message);
        throw new Error(`Failed to authenticate with SharePoint: ${error.message}`);
      }
    }
    return this.spr;
  }

  /**
   * Get items from SharePoint list with filter
   */
  async getSharePointItems(filter = null) {
    // Mock mode - return simulated data
    if (this.mockMode) {
      console.log('📋 Mock Mode: Returning simulated SharePoint data');
      const mockData = this.generateMockSharePointData();
      
      // Apply simple filter if provided
      if (filter && filter.includes('AssetID eq')) {
        const assetId = filter.match(/'([^']+)'/)?.[1];
        return mockData.filter(item => item.AssetID === assetId);
      }
      
      return mockData;
    }

    try {
      let url = `${this.siteUrl}/_api/web/lists/getbytitle('${this.listName}')/items`;
      
      if (filter) {
        url += `?$filter=${encodeURIComponent(filter)}`;
      }
      
      url += `${filter ? '&' : '?'}$top=5000`; // Get up to 5000 items
      
      // Use username/password authentication
      if (this.useUsernamePassword) {
        const spr = await this.initializeSharePointRequest();
        const response = await spr.get(url, {
          headers: {
            'Accept': 'application/json;odata=verbose'
          }
        });
        
        return response.body.d.results;
      }
      
      // Use client credentials authentication
      if (this.useClientCredentials) {
        const token = await this.getAccessToken();
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json;odata=verbose'
          }
        });
        
        return response.data.d.results;
      }
      
      throw new Error('No authentication method configured');
    } catch (error) {
      console.error('Error getting SharePoint items:', error.message);
      throw error;
    }
  }

  /**
   * Create item in SharePoint list
   */
  async createSharePointItem(data) {
    try {
      const token = await this.getAccessToken();
      
      const url = `${this.siteUrl}/_api/web/lists/getbytitle('${this.listName}')/items`;
      
      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });

      return response.data.d;
    } catch (error) {
      console.error('Error creating SharePoint item:', error.message);
      throw error;
    }
  }

  /**
   * Update item in SharePoint list
   */
  async updateSharePointItem(itemId, data) {
    try {
      const token = await this.getAccessToken();
      
      const url = `${this.siteUrl}/_api/web/lists/getbytitle('${this.listName}')/items(${itemId})`;
      
      await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'IF-MATCH': '*',
          'X-HTTP-Method': 'MERGE'
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating SharePoint item:', error.message);
      throw error;
    }
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(direction, entityType) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('direction', sql.NVarChar(50), direction)
        .input('entityType', sql.NVarChar(50), entityType)
        .query(`
          SELECT LastSyncTime 
          FROM LastSyncTimestamp 
          WHERE SyncDirection = @direction AND EntityType = @entityType
        `);

      return result.recordset[0]?.LastSyncTime || new Date('1900-01-01');
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return new Date('1900-01-01');
    }
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSyncTime(direction, entityType) {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('direction', sql.NVarChar(50), direction)
        .input('entityType', sql.NVarChar(50), entityType)
        .input('syncTime', sql.DateTime, new Date())
        .query(`
          UPDATE LastSyncTimestamp 
          SET LastSyncTime = @syncTime, UpdatedAt = GETDATE()
          WHERE SyncDirection = @direction AND EntityType = @entityType
        `);
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  /**
   * Log sync operation
   */
  async logSync(direction, entityType, entityId, sharePointItemId, operation, status, errorMessage = null, dataSnapshot = null) {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('direction', sql.NVarChar(50), direction)
        .input('entityType', sql.NVarChar(50), entityType)
        .input('entityId', sql.NVarChar(100), entityId)
        .input('sharePointItemId', sql.Int, sharePointItemId)
        .input('operation', sql.NVarChar(50), operation)
        .input('status', sql.NVarChar(50), status)
        .input('errorMessage', sql.NVarChar(sql.MAX), errorMessage)
        .input('dataSnapshot', sql.NVarChar(sql.MAX), dataSnapshot ? JSON.stringify(dataSnapshot) : null)
        .query(`
          INSERT INTO SyncLog 
          (SyncDirection, EntityType, EntityID, SharePointItemID, Operation, Status, ErrorMessage, DataSnapshot)
          VALUES 
          (@direction, @entityType, @entityId, @sharePointItemId, @operation, @status, @errorMessage, @dataSnapshot)
        `);
    } catch (error) {
      console.error('Error logging sync:', error);
    }
  }

  /**
   * Check if asset exists in database
   */
  async assetExistsInDatabase(assetId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('assetId', sql.NVarChar(50), assetId)
        .query('SELECT COUNT(*) as count FROM Assets WHERE AssetID = @assetId');
      
      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking asset existence:', error);
      return false;
    }
  }

  /**
   * Map SharePoint item to database asset
   */
  mapSharePointToAsset(spItem) {
    return {
      assetId: spItem.AssetID || spItem.Title,
      mainCategory: spItem.MainCategory,
      status: spItem.Status || 'Available',
      category: spItem.Category,
      modelName: spItem.ModelName,
      brand: spItem.Brand,
      model: spItem.Model,
      cpu: spItem.CPU,
      ram: spItem.RAM,
      hdd: spItem.HDD,
      serialNumber: spItem.SerialNumber,
      department: spItem.Department,
      datePurchase: spItem.DatePurchase ? new Date(spItem.DatePurchase) : null,
      dateFirstUse: spItem.DateFirstUse ? new Date(spItem.DateFirstUse) : null,
      price: parseFloat(spItem.Price) || 0,
      locationId: spItem.LocationID || null,
      companyId: spItem.CompanyID || null,
      sharePointItemId: spItem.ID
    };
  }

  /**
   * Map database asset to SharePoint item
   */
  mapAssetToSharePoint(asset) {
    return {
      __metadata: { type: 'SP.Data.ITAssetsListItem' }, // Adjust based on your list name
      Title: asset.AssetID,
      AssetID: asset.AssetID,
      MainCategory: asset.MainCategory,
      Status: asset.Status,
      Category: asset.Category,
      ModelName: asset.ModelName,
      Brand: asset.Brand,
      Model: asset.Model,
      CPU: asset.CPU,
      RAM: asset.Ram,
      HDD: asset.HDD,
      SerialNumber: asset.SerialNumber,
      Department: asset.Department,
      DatePurchase: asset.DatePurchase,
      DateFirstUse: asset.DateFirstUse,
      Price: asset.Price,
      LocationID: asset.LocationID,
      CompanyID: asset.CompanyID
    };
  }

  /**
   * Sync from SharePoint to Database (Import)
   */
  async syncFromSharePoint() {
    console.log('Starting sync from SharePoint to Database...');
    
    const results = {
      total: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    try {
      // Get last sync time
      const lastSyncTime = await this.getLastSyncTime('ToDatabase', 'Asset');
      console.log(`Last sync time: ${lastSyncTime}`);

      // Get items modified after last sync
      const filter = `Modified gt datetime'${lastSyncTime.toISOString()}'`;
      const spItems = await this.getSharePointItems(filter);
      
      results.total = spItems.length;
      console.log(`Found ${spItems.length} items to sync`);

      const pool = await poolPromise;

      for (const spItem of spItems) {
        try {
          const asset = this.mapSharePointToAsset(spItem);
          
          // Check if asset exists
          const exists = await this.assetExistsInDatabase(asset.assetId);

          if (exists) {
            // Update existing asset
            await pool.request()
              .input('assetId', sql.NVarChar(50), asset.assetId)
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
              .input('datePurchase', sql.DateTime, asset.datePurchase)
              .input('dateFirstUse', sql.DateTime, asset.dateFirstUse)
              .input('price', sql.Decimal(18, 2), asset.price)
              .input('locationId', sql.Int, asset.locationId)
              .input('companyId', sql.Int, asset.companyId)
              .query(`
                UPDATE Assets 
                SET MainCategory = @mainCategory,
                    Status = @status,
                    Category = @category,
                    ModelName = @modelName,
                    Brand = @brand,
                    Model = @model,
                    CPU = @cpu,
                    Ram = @ram,
                    HDD = @hdd,
                    SerialNumber = @serialNumber,
                    Department = @department,
                    DatePurchase = @datePurchase,
                    DateFirstUse = @dateFirstUse,
                    Price = @price,
                    LocationID = @locationId,
                    CompanyID = @companyId,
                    UpdatedAt = GETDATE()
                WHERE AssetID = @assetId
              `);

            results.updated++;
            await this.logSync('ToDatabase', 'Asset', asset.assetId, spItem.ID, 'Update', 'Success', null, asset);
          } else {
            // Insert new asset
            await pool.request()
              .input('assetId', sql.NVarChar(50), asset.assetId)
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
              .input('datePurchase', sql.DateTime, asset.datePurchase)
              .input('dateFirstUse', sql.DateTime, asset.dateFirstUse)
              .input('price', sql.Decimal(18, 2), asset.price)
              .input('locationId', sql.Int, asset.locationId)
              .input('companyId', sql.Int, asset.companyId)
              .query(`
                INSERT INTO Assets 
                (AssetID, MainCategory, Status, Category, ModelName, Brand, Model, CPU, Ram, HDD,
                 SerialNumber, Department, DatePurchase, DateFirstUse, Price, LocationID, CompanyID)
                VALUES 
                (@assetId, @mainCategory, @status, @category, @modelName, @brand, @model, @cpu, @ram, @hdd,
                 @serialNumber, @department, @datePurchase, @dateFirstUse, @price, @locationId, @companyId)
              `);

            results.inserted++;
            await this.logSync('ToDatabase', 'Asset', asset.assetId, spItem.ID, 'Insert', 'Success', null, asset);
          }
        } catch (error) {
          results.failed++;
          results.errors.push({ assetId: spItem.AssetID || spItem.Title, error: error.message });
          await this.logSync('ToDatabase', 'Asset', spItem.AssetID || spItem.Title, spItem.ID, 'Failed', 'Failed', error.message);
        }
      }

      // Update last sync time
      await this.updateLastSyncTime('ToDatabase', 'Asset');

      console.log('Sync from SharePoint completed:', results);
      return results;
    } catch (error) {
      console.error('Error in syncFromSharePoint:', error);
      throw error;
    }
  }

  /**
   * Sync from Database to SharePoint (Export)
   */
  async syncToSharePoint() {
    console.log('Starting sync from Database to SharePoint...');
    
    const results = {
      total: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    try {
      // Get last sync time
      const lastSyncTime = await this.getLastSyncTime('ToSharePoint', 'Asset');
      console.log(`Last sync time: ${lastSyncTime}`);

      // Get assets modified after last sync
      const pool = await poolPromise;
      const result = await pool.request()
        .input('lastSyncTime', sql.DateTime, lastSyncTime)
        .query(`
          SELECT * FROM Assets 
          WHERE UpdatedAt > @lastSyncTime OR CreatedAt > @lastSyncTime
          ORDER BY UpdatedAt DESC
        `);

      const assets = result.recordset;
      results.total = assets.length;
      console.log(`Found ${assets.length} assets to sync`);

      for (const asset of assets) {
        try {
          const spData = this.mapAssetToSharePoint(asset);

          // Check if item exists in SharePoint (by AssetID)
          const existingItems = await this.getSharePointItems(`AssetID eq '${asset.AssetID}'`);

          if (existingItems.length > 0) {
            // Update existing item
            await this.updateSharePointItem(existingItems[0].ID, spData);
            results.updated++;
            await this.logSync('ToSharePoint', 'Asset', asset.AssetID, existingItems[0].ID, 'Update', 'Success', null, asset);
          } else {
            // Create new item
            const newItem = await this.createSharePointItem(spData);
            results.inserted++;
            await this.logSync('ToSharePoint', 'Asset', asset.AssetID, newItem.ID, 'Insert', 'Success', null, asset);
          }
        } catch (error) {
          results.failed++;
          results.errors.push({ assetId: asset.AssetID, error: error.message });
          await this.logSync('ToSharePoint', 'Asset', asset.AssetID, null, 'Failed', 'Failed', error.message);
        }
      }

      // Update last sync time
      await this.updateLastSyncTime('ToSharePoint', 'Asset');

      console.log('Sync to SharePoint completed:', results);
      return results;
    } catch (error) {
      console.error('Error in syncToSharePoint:', error);
      throw error;
    }
  }

  /**
   * Perform bidirectional sync
   */
  async performBidirectionalSync() {
    console.log('Starting bidirectional sync...');
    
    const results = {
      fromSharePoint: null,
      toSharePoint: null,
      startTime: new Date(),
      endTime: null,
      duration: null
    };

    try {
      // First, sync from SharePoint to Database
      results.fromSharePoint = await this.syncFromSharePoint();

      // Then, sync from Database to SharePoint
      results.toSharePoint = await this.syncToSharePoint();

      results.endTime = new Date();
      results.duration = (results.endTime - results.startTime) / 1000; // seconds

      console.log('Bidirectional sync completed:', results);
      return results;
    } catch (error) {
      console.error('Error in bidirectional sync:', error);
      results.endTime = new Date();
      results.duration = (results.endTime - results.startTime) / 1000;
      results.error = error.message;
      throw error;
    }
  }

  /**
   * Test SharePoint connection
   */
  async testConnection() {
    console.log('Testing SharePoint connection...');
    
    const result = {
      success: false,
      message: '',
      mockMode: this.mockMode,
      authMethod: this.useUsernamePassword ? 'username/password' : (this.useClientCredentials ? 'client credentials' : 'mock'),
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
        // Mock mode - simulate successful connection
        console.log('📋 Mock Mode: Simulating SharePoint connection');
        result.details.authenticated = true;
        result.details.listAccessible = true;
        
        const items = this.generateMockSharePointData();
        result.details.itemCount = items.length;
        result.details.sampleItems = items.map(item => ({
          ID: item.ID,
          Title: item.Title,
          AssetID: item.AssetID,
          MainCategory: item.MainCategory,
          Status: item.Status,
          Modified: item.Modified
        }));

        result.success = true;
        result.message = `✓ MOCK MODE: Simulated connection successful. Found ${items.length} mock items in list "${this.listName}"`;
        
        console.log('✓ Mock connection test completed');
        return result;
      }

      // Real SharePoint connection
      console.log(`Testing with ${result.authMethod} authentication...`);
      
      // Test 1: Authentication
      console.log('Step 1: Testing authentication...');
      if (this.useUsernamePassword) {
        await this.initializeSharePointRequest();
        result.details.authenticated = true;
        console.log('✓ Username/password authentication successful');
      } else if (this.useClientCredentials) {
        await this.getAccessToken();
        result.details.authenticated = true;
        console.log('✓ Client credentials authentication successful');
      }

      // Test 2: Access SharePoint list
      console.log('Step 2: Testing list access...');
      const items = await this.getSharePointItems();
      result.details.listAccessible = true;
      result.details.itemCount = items.length;
      console.log(`✓ List accessible, found ${items.length} items`);

      // Test 3: Get sample items (first 5)
      result.details.sampleItems = items.slice(0, 5).map(item => ({
        ID: item.ID,
        Title: item.Title || item.AssetID,
        AssetID: item.AssetID || item.Title,
        MainCategory: item.MainCategory || item.Category,
        Status: item.Status,
        Modified: item.Modified
      }));

      result.success = true;
      result.message = `✓ Successfully connected to SharePoint using ${result.authMethod}. Found ${items.length} items in list "${this.listName}"`;
      
      console.log('✓ Connection test completed successfully');
      return result;
    } catch (error) {
      console.error('✗ Connection test failed:', error.message);
      result.success = false;
      result.message = `Connection failed: ${error.message}`;
      result.error = error.message;
      return result;
    }
  }

  /**
   * Compare data between SharePoint and Database
   */
  async compareData() {
    console.log('Comparing data between SharePoint and Database...');
    
    const comparison = {
      sharepoint: {
        total: 0,
        items: []
      },
      database: {
        total: 0,
        items: []
      },
      matching: {
        count: 0,
        items: []
      },
      onlyInSharePoint: {
        count: 0,
        items: []
      },
      onlyInDatabase: {
        count: 0,
        items: []
      },
      conflicts: {
        count: 0,
        items: []
      }
    };

    try {
      // Get SharePoint items
      console.log('Fetching SharePoint items...');
      const spItems = await this.getSharePointItems();
      comparison.sharepoint.total = spItems.length;
      comparison.sharepoint.items = spItems.map(item => ({
        ID: item.ID,
        AssetID: item.AssetID || item.Title,
        MainCategory: item.MainCategory,
        Status: item.Status,
        Brand: item.Brand,
        ModelName: item.ModelName,
        Modified: item.Modified
      }));

      // Get Database items
      console.log('Fetching Database items...');
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Assets');
      const dbAssets = result.recordset;
      comparison.database.total = dbAssets.length;
      comparison.database.items = dbAssets.map(asset => ({
        AssetID: asset.AssetID,
        MainCategory: asset.MainCategory,
        Status: asset.Status,
        Brand: asset.Brand,
        ModelName: asset.ModelName,
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

      // Find matching items
      console.log('Comparing items...');
      dbAssets.forEach(asset => {
        const assetId = asset.AssetID;
        if (spMap.has(assetId)) {
          const spItem = spMap.get(assetId);
          
          // Check for conflicts (different data)
          const hasConflict = 
            (spItem.MainCategory && spItem.MainCategory !== asset.MainCategory) ||
            (spItem.Status && spItem.Status !== asset.Status) ||
            (spItem.Brand && spItem.Brand !== asset.Brand);

          if (hasConflict) {
            comparison.conflicts.items.push({
              AssetID: assetId,
              sharepoint: {
                MainCategory: spItem.MainCategory,
                Status: spItem.Status,
                Brand: spItem.Brand,
                Modified: spItem.Modified
              },
              database: {
                MainCategory: asset.MainCategory,
                Status: asset.Status,
                Brand: asset.Brand,
                UpdatedAt: asset.UpdatedAt
              }
            });
          } else {
            comparison.matching.items.push({
              AssetID: assetId,
              MainCategory: asset.MainCategory,
              Status: asset.Status
            });
          }
        } else {
          comparison.onlyInDatabase.items.push({
            AssetID: assetId,
            MainCategory: asset.MainCategory,
            Status: asset.Status,
            Brand: asset.Brand
          });
        }
      });

      // Find items only in SharePoint
      spItems.forEach(item => {
        const assetId = item.AssetID || item.Title;
        if (!dbMap.has(assetId)) {
          comparison.onlyInSharePoint.items.push({
            ID: item.ID,
            AssetID: assetId,
            MainCategory: item.MainCategory,
            Status: item.Status,
            Brand: item.Brand
          });
        }
      });

      // Update counts
      comparison.matching.count = comparison.matching.items.length;
      comparison.onlyInSharePoint.count = comparison.onlyInSharePoint.items.length;
      comparison.onlyInDatabase.count = comparison.onlyInDatabase.items.length;
      comparison.conflicts.count = comparison.conflicts.items.length;

      console.log('Comparison completed:');
      console.log(`- Matching: ${comparison.matching.count}`);
      console.log(`- Only in SharePoint: ${comparison.onlyInSharePoint.count}`);
      console.log(`- Only in Database: ${comparison.onlyInDatabase.count}`);
      console.log(`- Conflicts: ${comparison.conflicts.count}`);

      return comparison;
    } catch (error) {
      console.error('Error comparing data:', error);
      throw error;
    }
  }

  /**
   * Load temporary preview data (no actual sync)
   */
  async previewSync(direction = 'fromSharePoint') {
    console.log(`Previewing sync: ${direction}...`);
    
    const preview = {
      direction,
      wouldInsert: [],
      wouldUpdate: [],
      wouldSkip: [],
      totalChanges: 0
    };

    try {
      if (direction === 'fromSharePoint') {
        // Preview: SharePoint to Database
        const spItems = await this.getSharePointItems();
        
        for (const spItem of spItems) {
          const asset = this.mapSharePointToAsset(spItem);
          const exists = await this.assetExistsInDatabase(asset.assetId);

          if (exists) {
            preview.wouldUpdate.push({
              AssetID: asset.assetId,
              MainCategory: asset.mainCategory,
              Status: asset.status,
              action: 'UPDATE'
            });
          } else {
            preview.wouldInsert.push({
              AssetID: asset.assetId,
              MainCategory: asset.mainCategory,
              Status: asset.status,
              action: 'INSERT'
            });
          }
        }
      } else {
        // Preview: Database to SharePoint
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Assets');
        const assets = result.recordset;

        for (const asset of assets) {
          const existingItems = await this.getSharePointItems(`AssetID eq '${asset.AssetID}'`);
          
          if (existingItems.length > 0) {
            preview.wouldUpdate.push({
              AssetID: asset.AssetID,
              MainCategory: asset.MainCategory,
              Status: asset.Status,
              action: 'UPDATE'
            });
          } else {
            preview.wouldInsert.push({
              AssetID: asset.AssetID,
              MainCategory: asset.MainCategory,
              Status: asset.Status,
              action: 'INSERT'
            });
          }
        }
      }

      preview.totalChanges = preview.wouldInsert.length + preview.wouldUpdate.length;

      console.log(`Preview completed: ${preview.totalChanges} changes would be made`);
      return preview;
    } catch (error) {
      console.error('Error previewing sync:', error);
      throw error;
    }
  }
}

module.exports = new SharePointService();
