-- IT Management System - Complete Database Schema
-- Database: IT management

USE [IT management];
GO

-- Drop existing tables if they exist (in correct order due to foreign keys)
IF OBJECT_ID('StockCountItems', 'U') IS NOT NULL DROP TABLE StockCountItems;
IF OBJECT_ID('StockCounts', 'U') IS NOT NULL DROP TABLE StockCounts;
IF OBJECT_ID('Stock', 'U') IS NOT NULL DROP TABLE Stock;
IF OBJECT_ID('Approvals', 'U') IS NOT NULL DROP TABLE Approvals;
IF OBJECT_ID('RequestItems', 'U') IS NOT NULL DROP TABLE RequestItems;
IF OBJECT_ID('Requests', 'U') IS NOT NULL DROP TABLE Requests;
IF OBJECT_ID('RequestTypes', 'U') IS NOT NULL DROP TABLE RequestTypes;
IF OBJECT_ID('CheckLogs', 'U') IS NOT NULL DROP TABLE CheckLogs;
IF OBJECT_ID('Assets', 'U') IS NOT NULL DROP TABLE Assets;
IF OBJECT_ID('BudgetPlans', 'U') IS NOT NULL DROP TABLE BudgetPlans;
IF OBJECT_ID('PRNumbers', 'U') IS NOT NULL DROP TABLE PRNumbers;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
IF OBJECT_ID('Locations', 'U') IS NOT NULL DROP TABLE Locations;
IF OBJECT_ID('Companies', 'U') IS NOT NULL DROP TABLE Companies;

-- Drop sequence if exists
IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'RequestNumberSeq')
    DROP SEQUENCE RequestNumberSeq;
GO

-- Core Tables for IT Management System

-- Companies table
CREATE TABLE Companies (
    CompanyID INT PRIMARY KEY IDENTITY(1,1),
    CompanyName NVARCHAR(200) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Locations table
CREATE TABLE Locations (
    LocationID INT PRIMARY KEY IDENTITY(1,1),
    LocationName NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500),
    Department NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Users table (extended for HR/Line Manager roles)
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    EmployeeID NVARCHAR(50) UNIQUE NOT NULL,
    Username NVARCHAR(100) NOT NULL,
    Email NVARCHAR(200) NOT NULL,
    Department NVARCHAR(100) NOT NULL,
    Position NVARCHAR(100),
    UserType NVARCHAR(50) NOT NULL CHECK (UserType IN ('Employee', 'LineManager', 'HR', 'IT', 'Finance', 'Admin')),
    IsActive BIT DEFAULT 1,
    ManagerID INT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ManagerID) REFERENCES Users(UserID)
);

-- PR Numbers table
CREATE TABLE PRNumbers (
    PRID INT PRIMARY KEY IDENTITY(1,1),
    PRNumber NVARCHAR(50) UNIQUE NOT NULL,
    Description NVARCHAR(500),
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(50) DEFAULT 'Draft',
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- Updated Assets table
CREATE TABLE Assets (
    AssetID NVARCHAR(50) PRIMARY KEY,
    Picture NVARCHAR(MAX),
    MainCategory NVARCHAR(100) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (Status IN ('Available', 'Assigned', 'Retired', 'Under Repair', 'Lost')),
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
    
    -- Assignment Information
    AssignedTo INT NULL,
    Department NVARCHAR(100),
    DateAssigned DATETIME NULL,
    
    -- Purchase Information
    DatePurchase DATETIME,
    DateFirstUse DATETIME,
    EndOfLife AS DATEADD(YEAR, 5, DateFirstUse),
    SerialNumber NVARCHAR(100) UNIQUE,
    SNType NVARCHAR(50),
    PRID INT,
    PONumber NVARCHAR(50),
    Price DECIMAL(18, 2),
    Invoice NVARCHAR(MAX),
    DeliveryNote NVARCHAR(MAX),
    
    -- Computer Specific
    ComputerName NVARCHAR(100),
    
    -- Location and Company
    CompanyID INT,
    LocationID INT,
    
    -- Additional Details
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
    
    -- Audit Fields
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    ModifiedBy INT,
    
    -- Foreign Keys
    FOREIGN KEY (PRID) REFERENCES PRNumbers(PRID),
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (AssignedTo) REFERENCES Users(UserID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (ModifiedBy) REFERENCES Users(UserID)
);

-- Request Types table
CREATE TABLE RequestTypes (
    RequestTypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    RequiresApproval BIT DEFAULT 1,
    WorkflowSteps NVARCHAR(MAX), -- JSON workflow definition
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Sequence for auto-generating request numbers
CREATE SEQUENCE RequestNumberSeq START WITH 1000 INCREMENT BY 1;
GO

-- Requests table
CREATE TABLE Requests (
    RequestID INT PRIMARY KEY IDENTITY(1,1),
    RequestNumber AS ('REQ-' + RIGHT('0000' + CAST(RequestID AS NVARCHAR(10)), 4)) PERSISTED,
    RequestTypeID INT NOT NULL,
    RequestedBy INT NOT NULL,
    Department NVARCHAR(100),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Priority NVARCHAR(20) DEFAULT 'Medium' CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),
    
    -- Headcount Request Specific
    IsNewHeadcount BIT DEFAULT 0,
    NewEmployeeName NVARCHAR(200),
    NewEmployeePosition NVARCHAR(100),
    NewEmployeeDepartment NVARCHAR(100),
    ExpectedJoinDate DATETIME,
    
    -- Replacement Request Specific
    IsReplacement BIT DEFAULT 0,
    ReplaceAssetID NVARCHAR(50),
    ReplacementReason NVARCHAR(500),
    
    -- Request Status
    Status NVARCHAR(50) DEFAULT 'Draft' CHECK (Status IN ('Draft', 'Submitted', 'LineManagerApproved', 'HRApproved', 'ITReview', 'Procurement', 'Completed', 'Rejected', 'Cancelled')),
    CurrentApprover INT NULL,
    
    -- Dates
    RequiredByDate DATETIME,
    SubmittedAt DATETIME,
    CompletedAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (RequestTypeID) REFERENCES RequestTypes(RequestTypeID),
    FOREIGN KEY (RequestedBy) REFERENCES Users(UserID),
    FOREIGN KEY (ReplaceAssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (CurrentApprover) REFERENCES Users(UserID)
);

-- Request Items table (for multiple assets in one request)
CREATE TABLE RequestItems (
    ItemID INT PRIMARY KEY IDENTITY(1,1),
    RequestID INT NOT NULL,
    AssetCategory NVARCHAR(100) NOT NULL,
    AssetType NVARCHAR(100) NOT NULL,
    Quantity INT DEFAULT 1,
    Specifications NVARCHAR(MAX),
    Justification NVARCHAR(500),
    RecommendedModel NVARCHAR(200),
    EstimatedCost DECIMAL(18, 2),
    
    -- Fulfillment
    AssignedAssetID NVARCHAR(50) NULL,
    IsFromStock BIT DEFAULT 0,
    
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID) ON DELETE CASCADE,
    FOREIGN KEY (AssignedAssetID) REFERENCES Assets(AssetID)
);

-- Approval Workflow table
CREATE TABLE Approvals (
    ApprovalID INT PRIMARY KEY IDENTITY(1,1),
    RequestID INT NOT NULL,
    ApproverID INT NOT NULL,
    ApprovalType NVARCHAR(50) CHECK (ApprovalType IN ('LineManager', 'HR', 'IT', 'Finance')),
    ApprovalOrder INT NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected', 'Skipped')),
    Comments NVARCHAR(500),
    ApprovedAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID),
    FOREIGN KEY (ApproverID) REFERENCES Users(UserID)
);

-- Stock and Inventory table
CREATE TABLE Stock (
    StockID INT PRIMARY KEY IDENTITY(1,1),
    AssetCategory NVARCHAR(100) NOT NULL,
    AssetType NVARCHAR(100) NOT NULL,
    CurrentQuantity INT DEFAULT 0,
    MinimumStockLevel INT DEFAULT 5,
    ReorderLevel INT DEFAULT 10,
    LocationID INT,
    LastRestocked DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
);

-- Stock Count/Physical Inventory table
CREATE TABLE StockCounts (
    CountID INT PRIMARY KEY IDENTITY(1,1),
    CountDate DATETIME NOT NULL,
    CountBy INT NOT NULL,
    LocationID INT NOT NULL,
    Status NVARCHAR(20) DEFAULT 'In Progress' CHECK (Status IN ('In Progress', 'Completed', 'Verified')),
    Notes NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (CountBy) REFERENCES Users(UserID),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
);

CREATE TABLE StockCountItems (
    CountItemID INT PRIMARY KEY IDENTITY(1,1),
    CountID INT NOT NULL,
    AssetID NVARCHAR(50) NOT NULL,
    ExpectedLocation INT,
    ActualLocation INT,
    Condition NVARCHAR(50),
    Notes NVARCHAR(500),
    
    FOREIGN KEY (CountID) REFERENCES StockCounts(CountID) ON DELETE CASCADE,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (ExpectedLocation) REFERENCES Locations(LocationID),
    FOREIGN KEY (ActualLocation) REFERENCES Locations(LocationID)
);

-- CheckLogs table (for asset check-in/check-out history)
CREATE TABLE CheckLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    AssetID NVARCHAR(50) NOT NULL,
    UserID INT NOT NULL,
    LocationID INT NOT NULL,
    ActionType NVARCHAR(20) NOT NULL CHECK (ActionType IN ('CheckIn', 'CheckOut', 'Transfer')),
    Timestamp DATETIME DEFAULT GETDATE(),
    Notes NVARCHAR(500),
    
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
);

-- BudgetPlans table
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

-- Companies
INSERT INTO Companies (CompanyName) VALUES 
('Main Company'),
('Branch Company A'),
('Branch Company B');

-- Locations
INSERT INTO Locations (LocationName, Address, Department) VALUES 
('Main Office', '123 Main St, Bangkok', 'IT'),
('Branch Office A', '456 Branch Rd, Chiang Mai', 'Sales'),
('Branch Office B', '789 Office Ave, Phuket', 'Marketing'),
('Warehouse', '321 Storage Ln, Bangkok', 'Operations');

-- Users
INSERT INTO Users (EmployeeID, Username, Email, Department, Position, UserType, ManagerID) VALUES 
('EMP001', 'Admin User', 'admin@company.com', 'IT', 'IT Manager', 'Admin', NULL),
('EMP002', 'John Manager', 'john.manager@company.com', 'Sales', 'Sales Manager', 'LineManager', 1),
('EMP003', 'Jane HR', 'jane.hr@company.com', 'HR', 'HR Manager', 'HR', 1),
('EMP004', 'Bob Staff', 'bob.staff@company.com', 'Sales', 'Sales Executive', 'Employee', 2),
('EMP005', 'Alice IT', 'alice.it@company.com', 'IT', 'IT Support', 'IT', 1);

-- PR Numbers
INSERT INTO PRNumbers (PRNumber, Description, CreatedBy, Status) VALUES 
('PR-2024-001', 'IT Equipment Purchase Q1', 1, 'Approved'),
('PR-2024-002', 'Office Equipment Q1', 1, 'Approved'),
('PR-2024-003', 'Computer Upgrade Q2', 1, 'Draft');

-- Assets
INSERT INTO Assets (
    AssetID, MainCategory, Status, Category, ModelName, Brand, Model, 
    CPU, Ram, HDD, SerialNumber, AssignedTo, Department, 
    DatePurchase, DateFirstUse, Price, CompanyID, LocationID, 
    ComputerName, CreatedBy, ModifiedBy
) VALUES 
(
    'AST001', 'Computer', 'Assigned', 'Laptop', 'Dell XPS 15', 'Dell', 'XPS 15 9500',
    'Intel Core i7-10750H', '16GB', '512GB SSD', 'DL123456789', 4, 'Sales',
    '2023-01-15', '2023-01-20', 1500.00, 1, 2, 'LAPTOP-SALES-01', 1, 1
),
(
    'AST002', 'Display', 'Available', 'Monitor', 'Dell UltraSharp 27"', 'Dell', 'U2720Q',
    NULL, NULL, NULL, 'DL987654321', NULL, 'IT',
    '2023-01-15', '2023-01-20', 400.00, 1, 1, NULL, 1, 1
),
(
    'AST003', 'Mobile Device', 'Assigned', 'Smartphone', 'iPhone 13', 'Apple', 'iPhone 13 Pro',
    'A15 Bionic', '6GB', '256GB', 'AP123456789', 2, 'Sales',
    '2023-03-10', '2023-03-15', 1200.00, 1, 2, NULL, 1, 1
),
(
    'AST004', 'Computer', 'Available', 'Desktop', 'HP EliteDesk 800', 'HP', 'EliteDesk 800 G6',
    'Intel Core i5-10500', '8GB', '256GB SSD', 'HP123456789', NULL, 'Marketing',
    '2022-06-20', '2022-06-25', 900.00, 1, 3, 'DESKTOP-MKT-01', 1, 1
),
(
    'AST005', 'Computer', 'Under Repair', 'Laptop', 'MacBook Pro 16"', 'Apple', 'MacBook Pro 16" M1',
    'Apple M1 Pro', '32GB', '1TB SSD', 'AP987654321', 5, 'IT',
    '2021-11-10', '2021-11-15', 2500.00, 1, 4, 'LAPTOP-IT-01', 1, 1
);

-- Request Types
INSERT INTO RequestTypes (TypeName, Description, RequiresApproval) VALUES 
('New Equipment', 'Request for new IT equipment', 1),
('Replacement', 'Request to replace existing equipment', 1),
('Repair', 'Request for equipment repair', 1),
('Headcount', 'New employee equipment request', 1);

-- Stock
INSERT INTO Stock (AssetCategory, AssetType, CurrentQuantity, MinimumStockLevel, ReorderLevel, LocationID) VALUES 
('Computer', 'Laptop', 5, 3, 5, 1),
('Computer', 'Desktop', 3, 2, 4, 1),
('Display', 'Monitor', 10, 5, 8, 1),
('Mobile Device', 'Smartphone', 2, 1, 3, 1);

-- CheckLogs
INSERT INTO CheckLogs (AssetID, UserID, LocationID, ActionType, Notes) VALUES 
('AST001', 4, 2, 'CheckOut', 'Assigned to sales team member'),
('AST002', 1, 1, 'CheckIn', 'Initial check-in'),
('AST003', 2, 2, 'CheckOut', 'Assigned to manager'),
('AST004', 1, 3, 'CheckIn', 'Initial check-in'),
('AST005', 5, 4, 'CheckOut', 'Sent for maintenance');

-- Budget Plans
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
CREATE INDEX IX_Assets_AssignedTo ON Assets(AssignedTo);
CREATE INDEX IX_Assets_DatePurchase ON Assets(DatePurchase);
CREATE INDEX IX_CheckLogs_AssetID ON CheckLogs(AssetID);
CREATE INDEX IX_CheckLogs_Timestamp ON CheckLogs(Timestamp);
CREATE INDEX IX_Requests_Status ON Requests(Status);
CREATE INDEX IX_Requests_RequestedBy ON Requests(RequestedBy);
CREATE INDEX IX_StockCounts_LocationID ON StockCounts(LocationID);
CREATE INDEX IX_StockCounts_CountDate ON StockCounts(CountDate);
CREATE INDEX IX_Users_EmployeeID ON Users(EmployeeID);
CREATE INDEX IX_Users_Department ON Users(Department);

GO

PRINT 'Database schema created successfully!';
