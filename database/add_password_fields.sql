-- Add Password and RequirePasswordChange columns to Users table

-- Add Password column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Password')
BEGIN
    ALTER TABLE Users ADD Password NVARCHAR(255) NULL;
    PRINT 'Password column added';
END
ELSE
BEGIN
    PRINT 'Password column already exists';
END

GO

-- Add RequirePasswordChange column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'RequirePasswordChange')
BEGIN
    ALTER TABLE Users ADD RequirePasswordChange BIT DEFAULT 0;
    PRINT 'RequirePasswordChange column added';
END
ELSE
BEGIN
    PRINT 'RequirePasswordChange column already exists';
END

GO

-- Update existing users to have password same as username (for demo purposes)
UPDATE Users 
SET Password = Username 
WHERE Password IS NULL;

PRINT 'Existing users updated with default passwords';

GO
