-- Migration: Make CreatedBy, ModifiedBy, and AssignedTo nullable in Assets table
-- This allows asset creation without requiring user authentication

USE [IT Management];
GO

-- Make CreatedBy nullable
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Assets') 
    AND name = 'CreatedBy' 
    AND is_nullable = 0
)
BEGIN
    ALTER TABLE Assets
    ALTER COLUMN CreatedBy INT NULL;
    PRINT 'CreatedBy column is now nullable';
END
ELSE
BEGIN
    PRINT 'CreatedBy column is already nullable';
END
GO

-- Make ModifiedBy nullable
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Assets') 
    AND name = 'ModifiedBy' 
    AND is_nullable = 0
)
BEGIN
    ALTER TABLE Assets
    ALTER COLUMN ModifiedBy INT NULL;
    PRINT 'ModifiedBy column is now nullable';
END
ELSE
BEGIN
    PRINT 'ModifiedBy column is already nullable';
END
GO

-- Make AssignedTo nullable (if it exists and is not nullable)
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Assets') 
    AND name = 'AssignedTo' 
    AND is_nullable = 0
)
BEGIN
    ALTER TABLE Assets
    ALTER COLUMN AssignedTo INT NULL;
    PRINT 'AssignedTo column is now nullable';
END
ELSE
BEGIN
    PRINT 'AssignedTo column is already nullable or does not exist';
END
GO

PRINT 'Migration completed successfully';
