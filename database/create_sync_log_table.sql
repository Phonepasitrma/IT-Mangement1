-- Create SyncLog table to track synchronization history
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SyncLog')
BEGIN
    CREATE TABLE SyncLog (
        SyncLogID INT PRIMARY KEY IDENTITY(1,1),
        SyncDirection NVARCHAR(50) NOT NULL, -- 'ToDatabase' or 'ToSharePoint'
        EntityType NVARCHAR(50) NOT NULL, -- 'Asset', 'User', etc.
        EntityID NVARCHAR(100) NOT NULL, -- AssetID or other identifier
        SharePointItemID INT NULL, -- SharePoint List Item ID
        Operation NVARCHAR(50) NOT NULL, -- 'Insert', 'Update', 'Skip'
        Status NVARCHAR(50) NOT NULL, -- 'Success', 'Failed', 'Skipped'
        ErrorMessage NVARCHAR(MAX) NULL,
        SyncedAt DATETIME DEFAULT GETDATE(),
        SyncedBy NVARCHAR(100) NULL,
        DataSnapshot NVARCHAR(MAX) NULL -- JSON snapshot of data
    );
    
    CREATE INDEX IX_SyncLog_EntityID ON SyncLog(EntityID);
    CREATE INDEX IX_SyncLog_SyncedAt ON SyncLog(SyncedAt);
    CREATE INDEX IX_SyncLog_Status ON SyncLog(Status);
    
    PRINT 'SyncLog table created successfully';
END
ELSE
BEGIN
    PRINT 'SyncLog table already exists';
END

GO

-- Create LastSyncTimestamp table to track last sync time
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LastSyncTimestamp')
BEGIN
    CREATE TABLE LastSyncTimestamp (
        SyncID INT PRIMARY KEY IDENTITY(1,1),
        SyncDirection NVARCHAR(50) NOT NULL,
        EntityType NVARCHAR(50) NOT NULL,
        LastSyncTime DATETIME NOT NULL,
        UpdatedAt DATETIME DEFAULT GETDATE(),
        UNIQUE(SyncDirection, EntityType)
    );
    
    PRINT 'LastSyncTimestamp table created successfully';
END
ELSE
BEGIN
    PRINT 'LastSyncTimestamp table already exists';
END

GO

-- Initialize last sync timestamps
IF NOT EXISTS (SELECT * FROM LastSyncTimestamp WHERE SyncDirection = 'ToDatabase' AND EntityType = 'Asset')
BEGIN
    INSERT INTO LastSyncTimestamp (SyncDirection, EntityType, LastSyncTime)
    VALUES ('ToDatabase', 'Asset', '1900-01-01');
    PRINT 'Initialized ToDatabase sync timestamp';
END

IF NOT EXISTS (SELECT * FROM LastSyncTimestamp WHERE SyncDirection = 'ToSharePoint' AND EntityType = 'Asset')
BEGIN
    INSERT INTO LastSyncTimestamp (SyncDirection, EntityType, LastSyncTime)
    VALUES ('ToSharePoint', 'Asset', '1900-01-01');
    PRINT 'Initialized ToSharePoint sync timestamp';
END

GO
