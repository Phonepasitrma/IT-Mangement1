-- Create AssetSequences table to track running numbers by category and year
CREATE TABLE AssetSequences (
    SequenceID INT PRIMARY KEY IDENTITY(1,1),
    Category NVARCHAR(100) NOT NULL,
    Year INT NOT NULL,
    LastSequence INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    UNIQUE(Category, Year)
);

-- Insert initial sequences for common categories
INSERT INTO AssetSequences (Category, Year, LastSequence) VALUES 
('Computer', 2024, 0),
('Display', 2024, 0),
('Mobile Device', 2024, 0),
('Network Equipment', 2024, 0),
('Printer', 2024, 0),
('Other', 2024, 0);
