-- Add CompanyCode column to Companies table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Companies') AND name = 'CompanyCode')
BEGIN
    ALTER TABLE Companies ADD CompanyCode NVARCHAR(4) NULL;
END

GO

-- Update existing companies with company codes (4 characters)
-- You should update these based on your actual company names
UPDATE Companies SET CompanyCode = 'RMAL' WHERE CompanyName LIKE '%RMA%' OR CompanyName LIKE '%RMA Group%';
UPDATE Companies SET CompanyCode = 'COMI' WHERE CompanyName LIKE '%Comin%';
UPDATE Companies SET CompanyCode = 'DEVC' WHERE CompanyName LIKE '%Devco%';
UPDATE Companies SET CompanyCode = 'UNKN' WHERE CompanyCode IS NULL;

GO

-- Make CompanyCode required after updating existing records
ALTER TABLE Companies ALTER COLUMN CompanyCode NVARCHAR(4) NOT NULL;

GO

-- Add unique constraint to CompanyCode
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_Companies_CompanyCode' AND object_id = OBJECT_ID('Companies'))
BEGIN
    ALTER TABLE Companies ADD CONSTRAINT UQ_Companies_CompanyCode UNIQUE (CompanyCode);
END

GO
