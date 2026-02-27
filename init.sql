IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'InvoiceDb')
BEGIN
    CREATE DATABASE InvoiceDb;
END
GO

USE InvoiceDb;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='User' AND xtype='U')
BEGIN
    CREATE TABLE [User] (
        UserId INT PRIMARY KEY IDENTITY(1,1),
        UserName NVARCHAR(100) NOT NULL,
        Password NVARCHAR(255) NOT NULL,
        RecordDate DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE Customer (
        CustomerId INT PRIMARY KEY IDENTITY(1,1),
        TaxNumber NVARCHAR(50),
        Title NVARCHAR(200),
        Address NVARCHAR(500),
        EMail NVARCHAR(100),
        UserId INT REFERENCES [User](UserId),
        RecordDate DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE Invoice (
        InvoiceId INT PRIMARY KEY IDENTITY(1,1),
        CustomerId INT REFERENCES Customer(CustomerId),
        InvoiceNumber NVARCHAR(50),
        InvoiceDate DATETIME,
        TotalAmount DECIMAL(18,2),
        UserId INT REFERENCES [User](UserId),
        RecordDate DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE InvoiceLine (
        InvoiceLineId INT PRIMARY KEY IDENTITY(1,1),
        InvoiceId INT REFERENCES Invoice(InvoiceId),
        ItemName NVARCHAR(200),
        Quentity INT,
        Price DECIMAL(18,2),
        UserId INT REFERENCES [User](UserId),
        RecordDate DATETIME DEFAULT GETDATE()
    );

    INSERT INTO [User] (UserName, Password) VALUES ('admin', 'admin123');
END
GO