-- Create Users table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Role NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create Locations table
CREATE TABLE Locations (
    LocationID INT PRIMARY KEY IDENTITY(1,1),
    LocationName NVARCHAR(100) NOT NULL,
    Department NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create Assets table
CREATE TABLE Assets (
    AssetID NVARCHAR(50) PRIMARY KEY,
    AssetName NVARCHAR(200) NOT NULL,
    Category NVARCHAR(100) NOT NULL,
    PurchaseDate DATE NOT NULL,
    PurchasePrice DECIMAL(18, 2) NOT NULL,
    DepreciationValue DECIMAL(18, 2) NOT NULL,
    CurrentValue DECIMAL(18, 2) NOT NULL,
    LocationID INT NOT NULL,
    QRCode NVARCHAR(MAX),
    Status NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
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

INSERT INTO Locations (LocationName, Department) VALUES 
('Main Office', 'IT'),
('Branch Office A', 'Sales'),
('Branch Office B', 'Marketing'),
('Warehouse', 'Operations');

INSERT INTO Assets (AssetID, AssetName, Category, PurchaseDate, PurchasePrice, DepreciationValue, CurrentValue, LocationID, Status) VALUES 
('AST001', 'Laptop Dell XPS 15', 'Computer', '2020-05-15', 1500.00, 300.00, 1200.00, 1, 'Available'),
('AST002', 'Monitor Dell 27"', 'Display', '2020-05-15', 400.00, 80.00, 320.00, 1, 'Available'),
('AST003', 'iPhone 12', 'Mobile', '2021-01-10', 800.00, 160.00, 640.00, 2, 'Checked Out'),
('AST004', 'iPad Pro', 'Tablet', '2019-11-20', 1000.00, 400.00, 600.00, 3, 'Available'),
('AST005', 'MacBook Pro 16"', 'Computer', '2018-07-05', 2500.00, 1250.00, 1250.00, 4, 'Maintenance');

INSERT INTO CheckLogs (AssetID, UserID, LocationID, ActionType, Notes) VALUES 
('AST001', 1, 1, 'CheckIn', 'Initial check-in'),
('AST002', 1, 1, 'CheckIn', 'Initial check-in'),
('AST003', 2, 2, 'CheckOut', 'Assigned to sales team'),
('AST004', 1, 3, 'CheckIn', 'Initial check-in'),
('AST005', 3, 4, 'CheckIn', 'Initial check-in');

INSERT INTO BudgetPlans (Year, Department, EstimatedReplacementCost, Approved) VALUES 
(2023, 'IT', 5000.00, 1),
(2023, 'Sales', 3000.00, 1),
(2023, 'Marketing', 2000.00, 0),
(2024, 'IT', 8000.00, 0),
(2024, 'Sales', 4000.00, 0);
```

## Backend Implementation

Let's start with the backend implementation:

### Backend Setup

```bash