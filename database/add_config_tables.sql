-- Create configuration tables for Asset Controller
USE [IT management];
GO

-- Main Categories table
IF OBJECT_ID('MainCategories', 'U') IS NOT NULL DROP TABLE MainCategories;
CREATE TABLE MainCategories (
    MainCategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    CategoryCode NVARCHAR(10) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Categories table
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL,
    MainCategoryID INT NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MainCategoryID) REFERENCES MainCategories(MainCategoryID),
    UNIQUE(CategoryName, MainCategoryID)
);

-- Departments table
IF OBJECT_ID('Departments', 'U') IS NOT NULL DROP TABLE Departments;
CREATE TABLE Departments (
    DepartmentID INT PRIMARY KEY IDENTITY(1,1),
    DepartmentName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Insert default Main Categories
INSERT INTO MainCategories (CategoryName, CategoryCode, Description) VALUES
('Computer', 'W', 'Desktop and laptop computers'),
('Display', 'D', 'Monitors and screens'),
('Mobile Device', 'M', 'Smartphones and tablets'),
('Network Equipment', 'N', 'Routers, switches, firewalls'),
('Printer', 'R', 'Printing devices'),
('Other', 'O', 'Other IT equipment');

-- Insert default Categories
DECLARE @ComputerID INT = (SELECT MainCategoryID FROM MainCategories WHERE CategoryName = 'Computer');
DECLARE @DisplayID INT = (SELECT MainCategoryID FROM MainCategories WHERE CategoryName = 'Display');
DECLARE @MobileID INT = (SELECT MainCategoryID FROM MainCategories WHERE CategoryName = 'Mobile Device');
DECLARE @NetworkID INT = (SELECT MainCategoryID FROM MainCategories WHERE CategoryName = 'Network Equipment');
DECLARE @PrinterID INT = (SELECT MainCategoryID FROM MainCategories WHERE CategoryName = 'Printer');
DECLARE @OtherID INT = (SELECT MainCategoryID FROM MainCategories WHERE CategoryName = 'Other');

INSERT INTO Categories (CategoryName, MainCategoryID, Description) VALUES
('Laptop', @ComputerID, 'Portable computers'),
('Desktop', @ComputerID, 'Desktop computers'),
('Workstation', @ComputerID, 'High-performance workstations'),
('All-in-One', @ComputerID, 'All-in-one computers'),
('Monitor', @DisplayID, 'Computer monitors'),
('Projector', @DisplayID, 'Projectors'),
('TV Screen', @DisplayID, 'TV screens'),
('Smartphone', @MobileID, 'Smartphones'),
('Tablet', @MobileID, 'Tablets'),
('iPad', @MobileID, 'iPads'),
('Router', @NetworkID, 'Network routers'),
('Switch', @NetworkID, 'Network switches'),
('Access Point', @NetworkID, 'Wireless access points'),
('Firewall', @NetworkID, 'Network firewalls'),
('Laser Printer', @PrinterID, 'Laser printers'),
('Inkjet Printer', @PrinterID, 'Inkjet printers'),
('Multi-function Printer', @PrinterID, 'Multi-function printers'),
('UPS', @OtherID, 'Uninterruptible power supply'),
('Scanner', @OtherID, 'Document scanners'),
('External HDD', @OtherID, 'External hard drives'),
('Webcam', @OtherID, 'Webcams');

-- Insert default Departments
INSERT INTO Departments (DepartmentName, Description) VALUES
('IT', 'Information Technology'),
('Sales', 'Sales Department'),
('Marketing', 'Marketing Department'),
('Finance', 'Finance Department'),
('HR', 'Human Resources'),
('Operations', 'Operations Department'),
('Customer Service', 'Customer Service'),
('Logistics', 'Logistics Department'),
('Administration', 'Administration'),
('Management', 'Management');

-- Add IsActive column to Companies table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Companies') AND name = 'IsActive')
BEGIN
    ALTER TABLE Companies ADD IsActive BIT DEFAULT 1;
    UPDATE Companies SET IsActive = 1 WHERE IsActive IS NULL;
END

-- Create indexes
CREATE INDEX IX_Categories_MainCategoryID ON Categories(MainCategoryID);
CREATE INDEX IX_MainCategories_IsActive ON MainCategories(IsActive);
CREATE INDEX IX_Categories_IsActive ON Categories(IsActive);
CREATE INDEX IX_Departments_IsActive ON Departments(IsActive);

GO

PRINT 'Configuration tables created successfully!';
