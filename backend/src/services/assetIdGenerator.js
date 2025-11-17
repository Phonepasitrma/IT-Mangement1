const { poolPromise, sql } = require('../config/database');

const AssetIdGenerator = {
  // Generate Asset ID based on: CategoryCode + LA + CompanyCode + LocationName + Year(2) + Sequence(5)
  // Total: 15 digits
  // Example: WLA001VTE2500001
  generateAssetId: async (mainCategory, companyId, locationId, purchaseDate) => {
    try {
      const pool = await poolPromise;
      
      // 1. Get CategoryCode from MainCategories table
      const categoryResult = await pool.request()
        .input('categoryName', sql.NVarChar(100), mainCategory)
        .query('SELECT CategoryCode FROM MainCategories WHERE CategoryName = @categoryName');
      
      const categoryCode = categoryResult.recordset[0]?.CategoryCode || 'O';
      
      // 2. Country code is fixed as LA
      const countryCode = 'LA';
      
      // 3. Get CompanyCode from Companies table (3 digits)
      const companyResult = await pool.request()
        .input('companyId', sql.Int, companyId)
        .query('SELECT CompanyCode FROM Companies WHERE CompanyID = @companyId');
      
      const companyCode = (companyResult.recordset[0]?.CompanyCode || '000').padStart(3, '0');
      
      // 4. Get LocationCode from Locations table (3 characters)
      const locationResult = await pool.request()
        .input('locationId', sql.Int, locationId)
        .query('SELECT LocationCode FROM Locations WHERE LocationID = @locationId');
      
      const locationCode = locationResult.recordset[0]?.LocationCode || 'UNK';
      
      // 5. Get year (2 digits)
      const year = new Date(purchaseDate).getFullYear();
      const yearCode = year.toString().slice(-2);
      
      // 6. Get next sequence number for this location (5 digits, continues forever)
      const sequenceResult = await pool.request()
        .input('locationId', sql.Int, locationId)
        .query(`
          MERGE AssetSequences AS target
          USING (SELECT @locationId AS LocationID) AS source
          ON target.LocationID = source.LocationID
          WHEN MATCHED THEN
            UPDATE SET LastSequence = LastSequence + 1, UpdatedAt = GETDATE()
          WHEN NOT MATCHED THEN
            INSERT (LocationID, LastSequence) VALUES (@locationId, 1);
          
          SELECT LastSequence FROM AssetSequences 
          WHERE LocationID = @locationId;
        `);
      
      const sequence = sequenceResult.recordset[0]?.LastSequence || 1;
      const sequenceCode = sequence.toString().padStart(5, '0');
      
      // 7. Generate final Asset ID (15 characters total)
      // Format: [1][2][3][3][2][5] = CategoryCode(1) + LA(2) + CompanyCode(3) + LocationCode(3) + Year(2) + Sequence(5)
      const assetId = `${categoryCode}${countryCode}${companyCode}${locationCode}${yearCode}${sequenceCode}`;
      
      return assetId;
    } catch (error) {
      console.error('Error generating asset ID:', error);
      throw error;
    }
  }
};

module.exports = AssetIdGenerator;
