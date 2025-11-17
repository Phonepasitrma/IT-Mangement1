-- Update AssetSequences table to track by Location instead of Category/Year
-- Drop the old table if it exists
IF OBJECT_ID('AssetSequences', 'U') IS NOT NULL
    DROP TABLE AssetSequences;

-- Create new AssetSequences table tracking by Location
CREATE TABLE AssetSequences (
    SequenceID INT PRIMARY KEY IDENTITY(1,1),
    LocationID INT NOT NULL,
    LastSequence INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_AssetSequences_Location FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    CONSTRAINT UQ_AssetSequences_Location UNIQUE(LocationID)
);

-- Initialize sequences for existing locations
INSERT INTO AssetSequences (LocationID, LastSequence)
SELECT LocationID, 0
FROM Locations;

GO
