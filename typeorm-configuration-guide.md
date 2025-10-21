# TypeORM Migration Guide

A comprehensive guide for setting up and managing TypeORM migrations in a NestJS application.

## Table of Contents

- [Database Setup](#database-setup)
- [Initial Migration Setup](#initial-migration-setup)
- [Migration Commands Reference](#migration-commands-reference)
- [Working with Entity Changes](#working-with-entity-changes)
- [Best Practices](#best-practices)

---

## Database Setup

### Creating a Database User

Open SQL Server Management Studio (SSMS), connect as an administrator (SA account), and execute the following script:

```sql
USE [nest-conn]
GO

-- Create login if it doesn't exist
CREATE LOGIN [Tifany Nyawira] WITH PASSWORD = 'PASSWORD'
GO

-- Create database user and assign permissions
CREATE USER [Tifany Nyawira] FOR LOGIN [Tifany Nyawira]
GO

ALTER ROLE db_owner ADD MEMBER [Tifany Nyawira]
GO
```

### Environment Configuration

Update your `.env` file with the proper credentials:

```env
# Database Connection
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=Tifany Nyawira
DB_PASSWORD=PASSWORD
# ...rest of the file remains the same...
```

### Restart Services

After making these changes:
1. Restart your SQL Server service
2. Restart your NestJS application

---

## Initial Migration Setup

### Generate Your First Migration

Create your initial migration by running:

```bash
pnpm run migration:generate src/migrations/InitialMigration
```

This command will:
- Create a new migration file in the `src/migrations` directory
- Name it with a timestamp followed by "InitialMigration"
- Generate the SQL needed based on your entity definitions

### Run the Migration

After generating the migration, apply it to your database:

```bash
pnpm run migration:run
```

### Check Migration Status

To verify which migrations have been applied:

```bash
pnpm run migration:show
```

### Prerequisites

Before running migrations, ensure:
- Your database connection is properly configured
- Your database server is running
- All your entities are properly defined and imported in your application

---

## Migration Commands Reference

### Command Structure

Each command uses `typeorm-ts-node-commonjs` with your `ormconfig.ts` file:

```bash
pnpm run migration:generate src/migrations/RelationshipsMigration
```

This executes:
```bash
typeorm-ts-node-commonjs -d ormconfig.ts migration:generate src/migrations/RelationshipsMigration
```

### Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `typeorm` | General TypeORM CLI | `pnpm run typeorm [command]` |
| `migration:generate` | Automatically creates migrations by comparing entities to database | `pnpm run migration:generate path/name` |
| `migration:create` | Creates an empty migration file | `pnpm run migration:create path/name` |
| `migration:run` | Runs pending migrations | `pnpm run migration:run` |
| `migration:revert` | Reverts the last executed migration | `pnpm run migration:revert` |
| `migration:show` | Shows all migrations and their status | `pnpm run migration:show` |

### How the Commands Work

When you run `pnpm run migration:generate`, TypeORM will:
1. Use the configuration in `ormconfig.ts`
2. Generate a migration by comparing your entities with the current database schema
3. Save it in the migrations directory with a timestamped filename

**Example successful output:**
```
Migration C:\Users\Tifany Nyawira\Documents\Documents\Training-Resources\NEST\Nest-refresher-master\src\migrations/1761076169914-RelationshipsMigration.ts has been generated successfully.
```

---

## Working with Entity Changes

### Complete Workflow

Follow these steps whenever you modify your entity definitions:

#### 1. Make Changes to Your Entities
Modify your entity files as needed (add/remove fields, change relationships, etc.).

#### 2. Generate a New Migration
Capture the entity changes in a new migration:

```bash
pnpm run migration:generate src/migrations/EntityChangeMigration
```

This will:
- Compare your current entities with the database schema
- Generate a new migration file with the necessary SQL to update the database
- Create a file named like `TIMESTAMP-EntityChangeMigration.ts`

#### 3. Review the Migration
Open the generated migration file and review the changes before applying them. Verify that it's doing what you expect.

#### 4. Run the Migration
Apply the changes to your database:

```bash
pnpm run migration:run
```

This executes all pending migrations, including your new one.

#### 5. Verify Changes
Connect to your database and verify that the changes have been applied correctly.

### When to Use Each Command

- **For New Changes**: Use `migration:generate` to automatically detect and create migrations
- **To Revert a Migration**: Use `migration:revert` if something goes wrong
- **To Check Migration Status**: Use `migration:show` to see which migrations have been run
- **For Custom Migrations**: Use `migration:create` to create an empty migration file and write custom SQL

### Example Workflow

```bash
# 1. Make changes to entities
# Edit your entity files...

# 2. Generate migration
pnpm run migration:generate src/migrations/AddNewFieldsMigration

# 3. Review the generated migration file
# Check src/migrations/TIMESTAMP-AddNewFieldsMigration.ts

# 4. Apply the changes to the database
pnpm run migration:run

# 5. If needed, revert the last migration
pnpm run migration:revert
```

---

## Best Practices

### 1. Make Small, Focused Changes
Create smaller migrations that are easier to manage and less likely to cause issues.

### 2. Always Back Up
Before running migrations on production, always back up your database.

### 3. Test Migrations
Run migrations on a development environment before applying them to production.

### 4. Version Control
Keep migrations in version control along with your code. Never modify migrations that have already been run.

### 5. Check Migration Status
Use `migration:show` regularly to see which migrations have been applied and verify your database state.

### 6. Sequential Application
Apply migrations in the order they were created. The timestamp in the filename ensures correct ordering.

### 7. Review Before Running
Always review generated migrations before running them to ensure they match your intentions.

---

## Troubleshooting

If you encounter issues:

1. **Check database connection**: Verify your `.env` configuration
2. **Verify TypeORM config**: Ensure `ormconfig.ts` is properly configured
3. **Check migration status**: Run `pnpm run migration:show` to see current state
4. **Review logs**: Check application and database logs for errors
5. **Revert if needed**: Use `pnpm run migration:revert` to roll back problematic migrations

---

Following this guide will ensure your database schema stays in sync with your entity definitions throughout your application's lifecycle.