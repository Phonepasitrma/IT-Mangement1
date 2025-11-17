const express = require('express');
const router = express.Router();
// Use PnPjs service instead of old service
const sharepointService = require('../services/sharepointServicePnP');
const { poolPromise, sql } = require('../config/database');

// Sync from SharePoint to Database
router.post('/from-sharepoint', async (req, res) => {
  try {
    const results = await sharepointService.syncFromSharePoint();
    res.status(200).json({
      message: 'Sync from SharePoint completed',
      results
    });
  } catch (error) {
    console.error('Error syncing from SharePoint:', error);
    res.status(500).json({
      message: 'Failed to sync from SharePoint',
      error: error.message
    });
  }
});

// Sync from Database to SharePoint
router.post('/to-sharepoint', async (req, res) => {
  try {
    const results = await sharepointService.syncToSharePoint();
    res.status(200).json({
      message: 'Sync to SharePoint completed',
      results
    });
  } catch (error) {
    console.error('Error syncing to SharePoint:', error);
    res.status(500).json({
      message: 'Failed to sync to SharePoint',
      error: error.message
    });
  }
});

// Bidirectional sync
router.post('/bidirectional', async (req, res) => {
  try {
    const results = await sharepointService.performBidirectionalSync();
    res.status(200).json({
      message: 'Bidirectional sync completed',
      results
    });
  } catch (error) {
    console.error('Error in bidirectional sync:', error);
    res.status(500).json({
      message: 'Failed to perform bidirectional sync',
      error: error.message
    });
  }
});

// Get sync logs
router.get('/logs', async (req, res) => {
  try {
    const { direction, entityType, status, limit = 100 } = req.query;
    
    const pool = await poolPromise;
    let query = 'SELECT TOP (@limit) * FROM SyncLog WHERE 1=1';
    const request = pool.request().input('limit', sql.Int, parseInt(limit));

    if (direction) {
      query += ' AND SyncDirection = @direction';
      request.input('direction', sql.NVarChar(50), direction);
    }

    if (entityType) {
      query += ' AND EntityType = @entityType';
      request.input('entityType', sql.NVarChar(50), entityType);
    }

    if (status) {
      query += ' AND Status = @status';
      request.input('status', sql.NVarChar(50), status);
    }

    query += ' ORDER BY SyncedAt DESC';

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error getting sync logs:', error);
    res.status(500).json({
      message: 'Failed to get sync logs',
      error: error.message
    });
  }
});

// Get sync statistics
router.get('/stats', async (req, res) => {
  try {
    const pool = await poolPromise;
    
    const result = await pool.request().query(`
      SELECT 
        SyncDirection,
        EntityType,
        Status,
        COUNT(*) as Count,
        MAX(SyncedAt) as LastSync
      FROM SyncLog
      GROUP BY SyncDirection, EntityType, Status
      ORDER BY SyncDirection, EntityType, Status
    `);

    const lastSyncResult = await pool.request().query(`
      SELECT * FROM LastSyncTimestamp
    `);

    res.status(200).json({
      statistics: result.recordset,
      lastSyncTimestamps: lastSyncResult.recordset
    });
  } catch (error) {
    console.error('Error getting sync stats:', error);
    res.status(500).json({
      message: 'Failed to get sync statistics',
      error: error.message
    });
  }
});

// Clear sync logs (with optional date filter)
router.delete('/logs', async (req, res) => {
  try {
    const { olderThan } = req.query; // Date string
    
    const pool = await poolPromise;
    let query = 'DELETE FROM SyncLog';
    
    if (olderThan) {
      query += ' WHERE SyncedAt < @olderThan';
      const result = await pool.request()
        .input('olderThan', sql.DateTime, new Date(olderThan))
        .query(query);
      
      res.status(200).json({
        message: `Deleted ${result.rowsAffected[0]} sync logs older than ${olderThan}`
      });
    } else {
      const result = await pool.request().query(query);
      res.status(200).json({
        message: `Deleted all ${result.rowsAffected[0]} sync logs`
      });
    }
  } catch (error) {
    console.error('Error clearing sync logs:', error);
    res.status(500).json({
      message: 'Failed to clear sync logs',
      error: error.message
    });
  }
});

// Test SharePoint connection
router.get('/test-connection', async (req, res) => {
  try {
    const result = await sharepointService.testConnection();
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({
      success: false,
      message: 'Connection test failed',
      error: error.message
    });
  }
});

// Compare data between SharePoint and Database
router.get('/compare', async (req, res) => {
  try {
    const comparison = await sharepointService.compareData();
    res.status(200).json({
      message: 'Data comparison completed',
      comparison
    });
  } catch (error) {
    console.error('Error comparing data:', error);
    res.status(500).json({
      message: 'Failed to compare data',
      error: error.message
    });
  }
});

// Preview sync (no actual changes)
router.get('/preview', async (req, res) => {
  try {
    const { direction = 'fromSharePoint' } = req.query;
    const preview = await sharepointService.previewSync(direction);
    
    res.status(200).json({
      message: 'Sync preview completed',
      preview
    });
  } catch (error) {
    console.error('Error previewing sync:', error);
    res.status(500).json({
      message: 'Failed to preview sync',
      error: error.message
    });
  }
});

// Process SharePoint data from MSAL (frontend authentication)
router.post('/process-sharepoint-data', async (req, res) => {
  try {
    const { items, source, siteId, listId } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        message: 'Invalid data: items array is required'
      });
    }

    console.log(`Processing ${items.length} items from ${source || 'MSAL'}`);
    
    const pool = await poolPromise;
    const results = {
      total: items.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    // Get locations and companies for mapping
    const locationsResult = await pool.request().query('SELECT LocationID, LocationName FROM Locations');
    const companiesResult = await pool.request().query('SELECT CompanyID, CompanyName FROM Companies');
    
    const locationMap = {};
    locationsResult.recordset.forEach(loc => {
      locationMap[loc.LocationName] = loc.LocationID;
    });

    const companyMap = {};
    companiesResult.recordset.forEach(comp => {
      companyMap[comp.CompanyName] = comp.CompanyID;
    });

    // Process each item
    for (const item of items) {
      try {
        const assetId = item.AssetID || item.Title;
        
        if (!assetId) {
          results.skipped++;
          continue;
        }

        // Map SharePoint fields to database fields
        const assetData = {
          AssetID: assetId,
          MainCategory: item.MainCategory || item.Category,
          SubCategory: item.SubCategory,
          Brand: item.Brand,
          ModelName: item.ModelName || item.Model,
          SerialNumber: item.SerialNumber,
          Specifications: item.Specifications,
          PurchaseDate: item.PurchaseDate ? new Date(item.PurchaseDate) : null,
          PurchasePrice: item.PurchasePrice,
          WarrantyExpiry: item.WarrantyExpiry ? new Date(item.WarrantyExpiry) : null,
          Status: item.Status || 'Available',
          Condition: item.Condition,
          AssignedTo: item.AssignedTo,
          Department: item.Department,
          LocationID: item.Location ? locationMap[item.Location] : null,
          CompanyID: item.Company ? companyMap[item.Company] : null,
          Notes: item.Notes
        };

        // Check if asset exists
        const checkResult = await pool.request()
          .input('AssetID', sql.NVarChar, assetId)
          .query('SELECT AssetID FROM Assets WHERE AssetID = @AssetID');

        if (checkResult.recordset.length > 0) {
          // Update existing asset
          await pool.request()
            .input('AssetID', sql.NVarChar, assetData.AssetID)
            .input('MainCategory', sql.NVarChar, assetData.MainCategory)
            .input('SubCategory', sql.NVarChar, assetData.SubCategory)
            .input('Brand', sql.NVarChar, assetData.Brand)
            .input('ModelName', sql.NVarChar, assetData.ModelName)
            .input('SerialNumber', sql.NVarChar, assetData.SerialNumber)
            .input('Specifications', sql.NVarChar, assetData.Specifications)
            .input('PurchaseDate', sql.Date, assetData.PurchaseDate)
            .input('PurchasePrice', sql.Decimal(18, 2), assetData.PurchasePrice)
            .input('WarrantyExpiry', sql.Date, assetData.WarrantyExpiry)
            .input('Status', sql.NVarChar, assetData.Status)
            .input('Condition', sql.NVarChar, assetData.Condition)
            .input('AssignedTo', sql.NVarChar, assetData.AssignedTo)
            .input('Department', sql.NVarChar, assetData.Department)
            .input('LocationID', sql.Int, assetData.LocationID)
            .input('CompanyID', sql.Int, assetData.CompanyID)
            .input('Notes', sql.NVarChar, assetData.Notes)
            .query(`
              UPDATE Assets SET
                MainCategory = @MainCategory,
                SubCategory = @SubCategory,
                Brand = @Brand,
                ModelName = @ModelName,
                SerialNumber = @SerialNumber,
                Specifications = @Specifications,
                PurchaseDate = @PurchaseDate,
                PurchasePrice = @PurchasePrice,
                WarrantyExpiry = @WarrantyExpiry,
                Status = @Status,
                Condition = @Condition,
                AssignedTo = @AssignedTo,
                Department = @Department,
                LocationID = @LocationID,
                CompanyID = @CompanyID,
                Notes = @Notes,
                UpdatedAt = GETDATE()
              WHERE AssetID = @AssetID
            `);
          
          results.updated++;
          
          // Log sync
          await pool.request()
            .input('SyncDirection', sql.NVarChar(50), 'ToDatabase')
            .input('EntityType', sql.NVarChar(50), 'Asset')
            .input('EntityID', sql.NVarChar(255), assetId)
            .input('SharePointItemID', sql.Int, item.ID || item.id)
            .input('Operation', sql.NVarChar(50), 'Update')
            .input('Status', sql.NVarChar(50), 'Success')
            .query(`
              INSERT INTO SyncLog (SyncDirection, EntityType, EntityID, SharePointItemID, Operation, Status, SyncedAt)
              VALUES (@SyncDirection, @EntityType, @EntityID, @SharePointItemID, @Operation, @Status, GETDATE())
            `);
        } else {
          // Insert new asset
          await pool.request()
            .input('AssetID', sql.NVarChar, assetData.AssetID)
            .input('MainCategory', sql.NVarChar, assetData.MainCategory)
            .input('SubCategory', sql.NVarChar, assetData.SubCategory)
            .input('Brand', sql.NVarChar, assetData.Brand)
            .input('ModelName', sql.NVarChar, assetData.ModelName)
            .input('SerialNumber', sql.NVarChar, assetData.SerialNumber)
            .input('Specifications', sql.NVarChar, assetData.Specifications)
            .input('PurchaseDate', sql.Date, assetData.PurchaseDate)
            .input('PurchasePrice', sql.Decimal(18, 2), assetData.PurchasePrice)
            .input('WarrantyExpiry', sql.Date, assetData.WarrantyExpiry)
            .input('Status', sql.NVarChar, assetData.Status)
            .input('Condition', sql.NVarChar, assetData.Condition)
            .input('AssignedTo', sql.NVarChar, assetData.AssignedTo)
            .input('Department', sql.NVarChar, assetData.Department)
            .input('LocationID', sql.Int, assetData.LocationID)
            .input('CompanyID', sql.Int, assetData.CompanyID)
            .input('Notes', sql.NVarChar, assetData.Notes)
            .query(`
              INSERT INTO Assets (
                AssetID, MainCategory, SubCategory, Brand, ModelName,
                SerialNumber, Specifications, PurchaseDate, PurchasePrice,
                WarrantyExpiry, Status, Condition, AssignedTo, Department,
                LocationID, CompanyID, Notes, CreatedAt, UpdatedAt
              ) VALUES (
                @AssetID, @MainCategory, @SubCategory, @Brand, @ModelName,
                @SerialNumber, @Specifications, @PurchaseDate, @PurchasePrice,
                @WarrantyExpiry, @Status, @Condition, @AssignedTo, @Department,
                @LocationID, @CompanyID, @Notes, GETDATE(), GETDATE()
              )
            `);
          
          results.inserted++;
          
          // Log sync
          await pool.request()
            .input('SyncDirection', sql.NVarChar(50), 'ToDatabase')
            .input('EntityType', sql.NVarChar(50), 'Asset')
            .input('EntityID', sql.NVarChar(255), assetId)
            .input('SharePointItemID', sql.Int, item.ID || item.id)
            .input('Operation', sql.NVarChar(50), 'Insert')
            .input('Status', sql.NVarChar(50), 'Success')
            .query(`
              INSERT INTO SyncLog (SyncDirection, EntityType, EntityID, SharePointItemID, Operation, Status, SyncedAt)
              VALUES (@SyncDirection, @EntityType, @EntityID, @SharePointItemID, @Operation, @Status, GETDATE())
            `);
        }
      } catch (error) {
        console.error(`Error processing item ${item.AssetID || item.Title}:`, error);
        results.failed++;
        results.errors.push({
          assetId: item.AssetID || item.Title,
          error: error.message
        });
        
        // Log failed sync
        try {
          await pool.request()
            .input('SyncDirection', sql.NVarChar(50), 'ToDatabase')
            .input('EntityType', sql.NVarChar(50), 'Asset')
            .input('EntityID', sql.NVarChar(255), item.AssetID || item.Title)
            .input('SharePointItemID', sql.Int, item.ID || item.id)
            .input('Operation', sql.NVarChar(50), 'Insert/Update')
            .input('Status', sql.NVarChar(50), 'Failed')
            .input('ErrorMessage', sql.NVarChar(sql.MAX), error.message)
            .query(`
              INSERT INTO SyncLog (SyncDirection, EntityType, EntityID, SharePointItemID, Operation, Status, ErrorMessage, SyncedAt)
              VALUES (@SyncDirection, @EntityType, @EntityID, @SharePointItemID, @Operation, @Status, @ErrorMessage, GETDATE())
            `);
        } catch (logError) {
          console.error('Error logging failed sync:', logError);
        }
      }
    }

    // Update last sync timestamp
    try {
      await pool.request()
        .input('SyncDirection', sql.NVarChar(50), 'ToDatabase')
        .input('EntityType', sql.NVarChar(50), 'Asset')
        .query(`
          MERGE INTO LastSyncTimestamp AS target
          USING (SELECT @SyncDirection AS SyncDirection, @EntityType AS EntityType) AS source
          ON target.SyncDirection = source.SyncDirection AND target.EntityType = source.EntityType
          WHEN MATCHED THEN
            UPDATE SET LastSyncTime = GETDATE()
          WHEN NOT MATCHED THEN
            INSERT (SyncDirection, EntityType, LastSyncTime)
            VALUES (@SyncDirection, @EntityType, GETDATE());
        `);
    } catch (error) {
      console.error('Error updating last sync timestamp:', error);
    }

    res.status(200).json({
      message: `Processed ${results.total} items from SharePoint (MSAL)`,
      results: {
        fromSharePoint: results
      }
    });
  } catch (error) {
    console.error('Error processing SharePoint data:', error);
    res.status(500).json({
      message: 'Failed to process SharePoint data',
      error: error.message
    });
  }
});

module.exports = router;
