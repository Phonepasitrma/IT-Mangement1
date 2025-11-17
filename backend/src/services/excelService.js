const XLSX = require('xlsx');
const sql = require('mssql');
const config = require('../config/database');

class ExcelService {
  // Export assets to Excel
  async exportToExcel() {
    try {
      const pool = await sql.connect(config);
      
      // Get all assets with related data
      const result = await pool.request().query(`
        SELECT 
          a.AssetID,
          a.MainCategory,
          a.SubCategory,
          a.Brand,
          a.ModelName,
          a.SerialNumber,
          a.Specifications,
          a.PurchaseDate,
          a.PurchasePrice,
          a.WarrantyExpiry,
          a.Status,
          a.Condition,
          a.AssignedTo,
          a.Department,
          a.Notes,
          l.LocationName,
          c.CompanyName,
          a.CreatedAt,
          a.UpdatedAt
        FROM Assets a
        LEFT JOIN Locations l ON a.LocationID = l.LocationID
        LEFT JOIN Companies c ON a.CompanyID = c.CompanyID
        ORDER BY a.CreatedAt DESC
      `);

      // Format data for Excel
      const data = result.recordset.map(asset => ({
        'Asset ID': asset.AssetID,
        'Main Category': asset.MainCategory,
        'Sub Category': asset.SubCategory,
        'Brand': asset.Brand,
        'Model Name': asset.ModelName,
        'Serial Number': asset.SerialNumber,
        'Specifications': asset.Specifications,
        'Purchase Date': asset.PurchaseDate ? new Date(asset.PurchaseDate).toISOString().split('T')[0] : '',
        'Purchase Price': asset.PurchasePrice,
        'Warranty Expiry': asset.WarrantyExpiry ? new Date(asset.WarrantyExpiry).toISOString().split('T')[0] : '',
        'Status': asset.Status,
        'Condition': asset.Condition,
        'Assigned To': asset.AssignedTo,
        'Department': asset.Department,
        'Location': asset.LocationName,
        'Company': asset.CompanyName,
        'Notes': asset.Notes,
        'Created At': asset.CreatedAt ? new Date(asset.CreatedAt).toISOString() : '',
        'Updated At': asset.UpdatedAt ? new Date(asset.UpdatedAt).toISOString() : ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, // Asset ID
        { wch: 15 }, // Main Category
        { wch: 15 }, // Sub Category
        { wch: 15 }, // Brand
        { wch: 20 }, // Model Name
        { wch: 20 }, // Serial Number
        { wch: 30 }, // Specifications
        { wch: 12 }, // Purchase Date
        { wch: 12 }, // Purchase Price
        { wch: 12 }, // Warranty Expiry
        { wch: 12 }, // Status
        { wch: 12 }, // Condition
        { wch: 20 }, // Assigned To
        { wch: 15 }, // Department
        { wch: 15 }, // Location
        { wch: 15 }, // Company
        { wch: 30 }, // Notes
        { wch: 20 }, // Created At
        { wch: 20 }  // Updated At
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Assets');

      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return {
        success: true,
        buffer,
        filename: `assets_export_${new Date().toISOString().split('T')[0]}.xlsx`,
        count: data.length
      };
    } catch (error) {
      console.error('Export to Excel error:', error);
      throw error;
    }
  }

  // Import assets from Excel
  async importFromExcel(fileBuffer) {
    try {
      const pool = await sql.connect(config);
      
      // Read Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const results = {
        total: data.length,
        inserted: 0,
        updated: 0,
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

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        try {
          // Map Excel columns to database fields
          const assetData = {
            AssetID: row['Asset ID'],
            MainCategory: row['Main Category'],
            SubCategory: row['Sub Category'] || null,
            Brand: row['Brand'] || null,
            ModelName: row['Model Name'] || null,
            SerialNumber: row['Serial Number'] || null,
            Specifications: row['Specifications'] || null,
            PurchaseDate: row['Purchase Date'] ? new Date(row['Purchase Date']) : null,
            PurchasePrice: row['Purchase Price'] || null,
            WarrantyExpiry: row['Warranty Expiry'] ? new Date(row['Warranty Expiry']) : null,
            Status: row['Status'] || 'Available',
            Condition: row['Condition'] || null,
            AssignedTo: row['Assigned To'] || null,
            Department: row['Department'] || null,
            LocationID: locationMap[row['Location']] || null,
            CompanyID: companyMap[row['Company']] || null,
            Notes: row['Notes'] || null
          };

          // Validate required fields
          if (!assetData.AssetID || !assetData.MainCategory) {
            results.errors.push({
              row: i + 2, // Excel row number (1-indexed + header)
              error: 'Missing required fields: Asset ID and Main Category are required'
            });
            continue;
          }

          // Check if asset exists
          const checkResult = await pool.request()
            .input('AssetID', sql.NVarChar, assetData.AssetID)
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
          }
        } catch (error) {
          results.errors.push({
            row: i + 2,
            assetId: row['Asset ID'],
            error: error.message
          });
        }
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Import from Excel error:', error);
      throw error;
    }
  }

  // Export template Excel file
  async exportTemplate() {
    try {
      const pool = await sql.connect(config);
      
      // Get reference data
      const locationsResult = await pool.request().query('SELECT LocationName FROM Locations');
      const companiesResult = await pool.request().query('SELECT CompanyName FROM Companies');

      // Create template with sample data and instructions
      const templateData = [
        {
          'Asset ID': 'WLAFORDVTE2500001',
          'Main Category': 'Workstation',
          'Sub Category': 'Laptop',
          'Brand': 'Dell',
          'Model Name': 'Latitude 5420',
          'Serial Number': 'SN123456',
          'Specifications': 'i5-1135G7, 16GB RAM, 512GB SSD',
          'Purchase Date': '2024-01-15',
          'Purchase Price': 1200.00,
          'Warranty Expiry': '2027-01-15',
          'Status': 'Available',
          'Condition': 'Excellent',
          'Assigned To': '',
          'Department': 'IT',
          'Location': 'Vientiane',
          'Company': 'Lao Ford City',
          'Notes': 'Sample asset entry'
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
        { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 30 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Assets');

      // Add reference data sheets
      if (locationsResult.recordset.length > 0) {
        const locationsData = locationsResult.recordset.map(l => ({ 'Location Name': l.LocationName }));
        const locationsWs = XLSX.utils.json_to_sheet(locationsData);
        XLSX.utils.book_append_sheet(wb, locationsWs, 'Locations');
      }

      if (companiesResult.recordset.length > 0) {
        const companiesData = companiesResult.recordset.map(c => ({ 'Company Name': c.CompanyName }));
        const companiesWs = XLSX.utils.json_to_sheet(companiesData);
        XLSX.utils.book_append_sheet(wb, companiesWs, 'Companies');
      }

      // Add instructions sheet
      const instructions = [
        { 'Field': 'Asset ID', 'Required': 'Yes', 'Description': 'Unique asset identifier (e.g., WLAFORDVTE2500001)' },
        { 'Field': 'Main Category', 'Required': 'Yes', 'Description': 'Asset category (Workstation, Display, Printer, etc.)' },
        { 'Field': 'Sub Category', 'Required': 'No', 'Description': 'Asset sub-category (Laptop, Desktop, Monitor, etc.)' },
        { 'Field': 'Brand', 'Required': 'No', 'Description': 'Manufacturer brand name' },
        { 'Field': 'Model Name', 'Required': 'No', 'Description': 'Product model name' },
        { 'Field': 'Serial Number', 'Required': 'No', 'Description': 'Manufacturer serial number' },
        { 'Field': 'Specifications', 'Required': 'No', 'Description': 'Technical specifications' },
        { 'Field': 'Purchase Date', 'Required': 'No', 'Description': 'Date format: YYYY-MM-DD' },
        { 'Field': 'Purchase Price', 'Required': 'No', 'Description': 'Numeric value (e.g., 1200.00)' },
        { 'Field': 'Warranty Expiry', 'Required': 'No', 'Description': 'Date format: YYYY-MM-DD' },
        { 'Field': 'Status', 'Required': 'No', 'Description': 'Available, Assigned, Maintenance, Retired' },
        { 'Field': 'Condition', 'Required': 'No', 'Description': 'Excellent, Good, Fair, Poor' },
        { 'Field': 'Assigned To', 'Required': 'No', 'Description': 'Person name if assigned' },
        { 'Field': 'Department', 'Required': 'No', 'Description': 'Department name' },
        { 'Field': 'Location', 'Required': 'No', 'Description': 'Must match location name from Locations sheet' },
        { 'Field': 'Company', 'Required': 'No', 'Description': 'Must match company name from Companies sheet' },
        { 'Field': 'Notes', 'Required': 'No', 'Description': 'Additional notes or comments' }
      ];
      const instructionsWs = XLSX.utils.json_to_sheet(instructions);
      instructionsWs['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return {
        success: true,
        buffer,
        filename: 'assets_import_template.xlsx'
      };
    } catch (error) {
      console.error('Export template error:', error);
      throw error;
    }
  }
}

module.exports = new ExcelService();
