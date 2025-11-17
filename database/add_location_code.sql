-- Add LocationCode column to Locations table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Locations') AND name = 'LocationCode')
BEGIN
    ALTER TABLE Locations ADD LocationCode NVARCHAR(3) NULL;
END

GO

-- Update existing locations with location codes (3 characters)
-- You should update these based on your actual location names
UPDATE Locations SET LocationCode = 'VTE' WHERE LocationName LIKE '%Vientiane%' OR LocationName LIKE '%VTE%';
UPDATE Locations SET LocationCode = 'LPB' WHERE LocationName LIKE '%Luang Prabang%' OR LocationName LIKE '%LPB%';
UPDATE Locations SET LocationCode = 'SVK' WHERE LocationName LIKE '%Savannakhet%' OR LocationName LIKE '%SVK%';
UPDATE Locations SET LocationCode = 'PKS' WHERE LocationName LIKE '%Pakse%' OR LocationName LIKE '%PKS%';
UPDATE Locations SET LocationCode = 'CHM' WHERE LocationName LIKE '%Champasak%' OR LocationName LIKE '%CHM%';
UPDATE Locations SET LocationCode = 'XYB' WHERE LocationName LIKE '%Xayaboury%' OR LocationName LIKE '%XYB%';
UPDATE Locations SET LocationCode = 'BKX' WHERE LocationName LIKE '%Bokeo%' OR LocationName LIKE '%BKX%';
UPDATE Locations SET LocationCode = 'UNK' WHERE LocationCode IS NULL;

GO

-- Make LocationCode required after updating existing records
ALTER TABLE Locations ALTER COLUMN LocationCode NVARCHAR(3) NOT NULL;

GO

-- Add unique constraint to LocationCode
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_Locations_LocationCode' AND object_id = OBJECT_ID('Locations'))
BEGIN
    ALTER TABLE Locations ADD CONSTRAINT UQ_Locations_LocationCode UNIQUE (LocationCode);
END

GO
