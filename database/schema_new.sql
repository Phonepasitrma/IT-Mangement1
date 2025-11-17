-- Drop existing tables if they exist (in correct order due to foreign keys)
IF OBJECT_ID('StockCounts', 'U') IS NOT NULL DROP TABLE StockCounts;
IF OBJECT_ID('CheckLogs', 'U') IS NOT NULL DROP TABLE CheckLogs;
IF OBJECT_ID('Assets', 'U') IS NOT NULL DROP TABLE Assets;
IF OBJECT_ID('BudgetPlans', 'U') IS NOT NULL DROP TABLE BudgetPlans;
IF OBJECT_ID('Locations', 'U') IS NOT NULL DROP TABLE Locations;
IF OBJECT_ID('Companies', 'U') IS NOT NULL DROP TABLE Companies;
IF OBJECT_ID('PRNumbers', 'U') IS NOT NULL DROP TABLE PRNumbers;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;

-- Create Users table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Role NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create Companies table
CREATE TABLE Companies (
    CompanyID INT PRIMARY KEY IDENTITY(1,1),
    CompanyName NVARCHAR(200) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create Locations table
CREATE TABLE Locations (
    LocationID INT PRIMARY KEY IDENTITY(1,1),
    LocationName NVARCHAR(100) NOT NULL,
    Department NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create PRNumbers table (Purchase Request)
CREATE TABLE PRNumbers (
    PRID INT PRIMARY KEY IDENTITY(1,1),
    PRNumber NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create comprehensive Assets table
CREATE TABLE Assets (
    AssetID NVARCHAR(50) PRIMARY KEY,
    Picture NVARCHAR(MAX),
    MainCategory NVARCHAR(100),
    Status NVARCHAR(50) NOT NULL DEFAULT 'Available',
    Category NVARCHAR(100),
    ModelName NVARCHAR(200),
    Brand NVARCHAR(100),
    Model NVARCHAR(200),
    CPU NVARCHAR(100),
    Ram NVARCHAR(50),
    HDD NVARCHAR(50),
    WLANMACAddress NVARCHAR(50),
    LANMACAddress NVARCHAR(50),
    Description NVARCHAR(MAX),
    UserName NVARCHAR(100),
    Department NVARCHAR(100),
    DatePurchase DATETIME,
    DateFirstUse DATETIME,
    EndOfLife AS DATEADD(YEAR, 5, DateFirstUse),
    SerialNumber NVARCHAR(100),
    SNType NVARCHAR(50),
    PRID INT,
    PONumber NVARCHAR(50),
    Price DECIMAL(18, 2),
    Invoice NVARCHAR(MAX),
    DeliveryNote NVARCHAR(MAX),
    ComputerName NVARCHAR(100),
    CompanyID INT,
    LocationID INT,
    Accessories NVARCHAR(500),
    Comment NVARCHAR(MAX),
    Year AS YEAR(DatePurchase),
    
    -- Supplier Warranty & Insurance
    SupplierWarrantyType NVARCHAR(100),
    SupplierWarrantyScope NVARCHAR(100),
    SupplierWarrantyServiceMethod NVARCHAR(100),
    SupplierWarrantyStart DATETIME,
    SupplierWarrantyEnd DATETIME,
    ReplacementCost DECIMAL(18, 2),
    
    -- Additional Warranty & Insurance
    AdditionalWarranty NVARCHAR(100),
    AdditionalWarrantyCompany NVARCHAR(200),
    AdditionalWarrantyType NVARCHAR(100),
    AdditionalWarrantyScope NVARCHAR(100),
    AdditionalWarrantyServiceMethod NVARCHAR(100),
    AdditionalWarrantyStart DATETIME,
    AdditionalWarrantyEnd DATETIME,
    
    Month AS MONTH(DatePurchase),
    TestNumber NVARCHAR(50),
    
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    ModifiedBy INT,
    
    FOREIGN KEY (PRID) REFERENCES PRNumbers(PRID),
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (ModifiedBy) REFERENCES Users(UserID)
);

-- Create CheckLogs table
CREATE TABLE CheckLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    AssetID NVARCHAR(50) NOT NULL,
    UserID INT NOT NULL,
    LocationID INT NOT NULL,
    ActionType NVARCHAR(20) NOT NULL,
    Timestamp DATETIME DEFAULT GETDATE(),
    Notes NVARCHAR(500),
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
);

-- Create StockCounts table
CREATE TABLE StockCounts (
    CountID INT PRIMARY KEY IDENTITY(1,1),
    LocationID INT NOT NULL,
    AssetID NVARCHAR(50) NOT NULL,
    UserID INT NOT NULL,
    CountDate DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    Notes NVARCHAR(500),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Create BudgetPlans table
CREATE TABLE BudgetPlans (
    PlanID INT PRIMARY KEY IDENTITY(1,1),
    Year INT NOT NULL,
    Department NVARCHAR(100) NOT NULL,
    EstimatedReplacementCost DECIMAL(18, 2) NOT NULL,
    Approved BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Insert sample data
INSERT INTO Users (Name, Role, Email) VALUES 
('Admin User', 'Admin', 'admin@company.com'),
('Staff User', 'Staff', 'staff@company.com'),
('Manager User', 'Manager', 'manager@company.com');

INSERT INTO Companies (CompanyName) VALUES 
('Main Company'),
('Branch Company A'),
('Branch Company B');

INSERT INTO Locations (LocationName, Department) VALUES 
('Main Office', 'IT'),
('Branch Office A', 'Sales'),
('Branch Office B', 'Marketing'),
('Warehouse', 'Operations');

INSERT INTO PRNumbers (PRNumber, Description) VALUES 
('PR-2023-001', 'IT Equipment Purchase'),
('PR-2023-002', 'Office Equipment'),
('PR-2024-001', 'Computer Upgrade');

INSERT INTO Assets (
    AssetID, MainCategory, Status, Category, ModelName, Brand, Model, 
    CPU, Ram, HDD, SerialNumber, UserName, Department, 
    DatePurchase, DateFirstUse, Price, CompanyID, LocationID, CreatedBy, ModifiedBy
) VALUES 
(
    'AST001', 'Computer', 'Available', 'Laptop', 'Dell XPS 15', 'Dell', 'XPS 15 9500',
    'Intel Core i7-10750H', '16GB', '512GB SSD', 'DL123456789', 'John Doe', 'IT',
    '2023-01-15', '2023-01-20', 1500.00, 1, 1, 1, 1
),
(
    'AST002', 'Display', 'Available', 'Monitor', 'Dell UltraSharp 27"', 'Dell', 'U2720Q',
    NULL, NULL, NULL, 'DL987654321', 'Jane Smith', 'IT',
    '2023-01-15', '2023-01-20', 400.00, 1, 1, 1, 1
),
(
    'AST003', 'Mobile Device', 'Checked Out', 'Smartphone', 'iPhone 13', 'Apple', 'iPhone 13 Pro',
    'A15 Bionic', '6GB', '256GB', 'AP123456789', 'Bob Johnson', 'Sales',
    '2023-03-10', '2023-03-15', 1200.00, 1, 2, 1, 1
),
(
    'AST004', 'Computer', 'Available', 'Desktop', 'HP EliteDesk 800', 'HP', 'EliteDesk 800 G6',
    'Intel Core i5-10500', '8GB', '256GB SSD', 'HP123456789', 'Alice Brown', 'Marketing',
    '2022-06-20', '2022-06-25', 900.00, 1, 3, 1, 1
),
(
    'AST005', 'Computer', 'Maintenance', 'Laptop', 'MacBook Pro 16"', 'Apple', 'MacBook Pro 16" M1',
    'Apple M1 Pro', '32GB', '1TB SSD', 'AP987654321', 'Charlie Wilson', 'Operations',
    '2021-11-10', '2021-11-15', 2500.00, 1, 4, 1, 1
);

INSERT INTO CheckLogs (AssetID, UserID, LocationID, ActionType, Notes) VALUES 
('AST001', 1, 1, 'CheckIn', 'Initial check-in'),
('AST002', 1, 1, 'CheckIn', 'Initial check-in'),
('AST003', 2, 2, 'CheckOut', 'Assigned to sales team'),
('AST004', 1, 3, 'CheckIn', 'Initial check-in'),
('AST005', 3, 4, 'CheckIn', 'Sent for maintenance');

INSERT INTO BudgetPlans (Year, Department, EstimatedReplacementCost, Approved) VALUES 
(2024, 'IT', 8000.00, 1),
(2024, 'Sales', 4000.00, 1),
(2024, 'Marketing', 3000.00, 0),
(2025, 'IT', 10000.00, 0),
(2025, 'Operations', 5000.00, 0);

-- Create indexes for better performance
CREATE INDEX IX_Assets_Status ON Assets(Status);
CREATE INDEX IX_Assets_Department ON Assets(Department);
CREATE INDEX IX_Assets_LocationID ON Assets(LocationID);
CREATE INDEX IX_Assets_CompanyID ON Assets(CompanyID);
CREATE INDEX IX_Assets_DatePurchase ON Assets(DatePurchase);
CREATE INDEX IX_CheckLogs_AssetID ON CheckLogs(AssetID);
CREATE INDEX IX_CheckLogs_Timestamp ON CheckLogs(Timestamp);
CREATE INDEX IX_StockCounts_LocationID ON StockCounts(LocationID);
CREATE INDEX IX_StockCounts_CountDate ON StockCounts(CountDate);
