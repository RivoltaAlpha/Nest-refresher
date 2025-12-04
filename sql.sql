-- Drop migrations table if it exists
IF OBJECT_ID('dbo.migrations', 'U') IS NOT NULL
    DROP TABLE dbo.migrations;

-- Drop all foreign key constraints first
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql = @sql + 'ALTER TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + 
              ' DROP CONSTRAINT ' + QUOTENAME(CONSTRAINT_NAME) + ';' + CHAR(13)
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' AND TABLE_SCHEMA = 'dbo';
EXEC sp_executesql @sql;

-- Drop all tables
SET @sql = '';
SELECT @sql = @sql + 'DROP TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + ';' + CHAR(13)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo';
EXEC sp_executesql @sql;

-- Check remaining tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo';