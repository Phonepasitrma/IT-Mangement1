-- Migration: Add Department column to Locations table if it doesn't exist
USE [IT management];
GO

-- Check if Department column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Locations') 
    AND name = 'Department'
)
BEGIN
    ALTER TABLE Locations ADD Department NVARCHAR(100);
    PRINT 'Department column added to Locations table';
END
ELSE
BEGIN
    PRINT 'Department column already exists in Locations table';
END
GO

-- Update existing locations with default department values
UPDATE Locations SET Department = 'General' WHERE Department IS NULL;
GO

PRINT 'Migration completed successfully';
