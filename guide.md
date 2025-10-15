# MSSQL + TypeORM Integration Guide for NestJS

Complete guide to integrate Microsoft SQL Server with TypeORM in a NestJS application.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Configuration](#database-configuration)
- [Entity Column Types](#entity-column-types)
- [Setting Up Entities](#setting-up-entities)
- [Migrations](#migrations)
- [Azure SQL Database Deployment](#azure-sql-database-deployment)
- [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites

- Node.js (v14 or higher)
- NestJS application
- Access to MSSQL Server (local, Azure SQL, or other cloud provider)

---

## Installation

### 1. Install Required Packages

```bash
npm install @nestjs/typeorm typeorm mssql
npm install @nestjs/config dotenv
```

### 2. Package Versions (Recommended)

```json
{
  "dependencies": {
    "@nestjs/typeorm": "^10.0.0",
    "typeorm": "^0.3.17",
    "mssql": "^10.0.1",
    "@nestjs/config": "^3.1.1"
  }
}
```

---

## Database Configuration

### 1. Create Database Module

**File: `src/database/database.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 1433),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        schema: configService.get<string>('DB_SCHEMA', 'dbo'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNC', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
        migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
        
        // MSSQL-specific options
        options: {
          encrypt: configService.get<boolean>('DB_ENCRYPT', true),
          trustServerCertificate: configService.get<boolean>('DB_TRUST_CERT', false),
          enableAnsiNullDefault: true,
          instanceName: configService.get<string>('DB_INSTANCE_NAME'),
        },
        
        // Connection pool settings
        pool: {
          max: configService.get<number>('DB_POOL_MAX', 10),
          min: configService.get<number>('DB_POOL_MIN', 0),
          idleTimeoutMillis: 30000,
        },
        
        requestTimeout: 15000,
        connectionTimeout: 15000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### 2. Import Database Module

**File: `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    // ... other modules
  ],
})
export class AppModule {}
```

### 3. Environment Variables

**File: `.env`**

```env
# Database Connection
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourPassword123!
DB_NAME=your_database_name
DB_SCHEMA=dbo

# MSSQL Options
DB_ENCRYPT=false              # Set to true for Azure SQL
DB_TRUST_CERT=true           # Set to true for local development
DB_INSTANCE_NAME=             # Optional: for named instances

# Connection Pool
DB_POOL_MAX=10
DB_POOL_MIN=0

# Development Settings
DB_SYNC=false                # NEVER true in production!
DB_LOGGING=true              # Enable for debugging
```

**For Azure SQL Database:**

```env
DB_HOST=your-server.database.windows.net
DB_PORT=1433
DB_USERNAME=your-admin-username
DB_PASSWORD=YourSecurePassword123!
DB_NAME=your-database-name
DB_SCHEMA=dbo
DB_ENCRYPT=true              # MUST be true for Azure
DB_TRUST_CERT=false
```

---

## Entity Column Types

### Complete TypeORM to MSSQL Type Mapping

| TypeORM Type | MSSQL Type | Usage | Example |
|--------------|------------|-------|---------|
| `int` | `int` | Standard integers | User IDs, counts |
| `bigint` | `bigint` | Large integers | Large IDs, timestamps |
| `smallint` | `smallint` | Small integers | Status codes, flags |
| `tinyint` | `tinyint` | Tiny integers (0-255) | Age, small counts |
| `bit` | `bit` | Boolean values | isActive, isDeleted |
| `decimal` | `decimal(p,s)` | Exact numeric | Money, precise calculations |
| `numeric` | `numeric(p,s)` | Exact numeric (alias) | Same as decimal |
| `float` | `float` | Approximate numeric | Scientific calculations |
| `real` | `real` | Approximate numeric (smaller) | Less precise float |
| `money` | `money` | Currency | Monetary values |
| `smallmoney` | `smallmoney` | Small currency | Small monetary values |
| `varchar` | `varchar(n)` | Variable-length string | Short text (n ≤ 8000) |
| `varchar` | `varchar(n)` | Unicode string | International text (n ≤ 4000) |
| `char` | `char(n)` | Fixed-length string | Fixed codes |
| `nchar` | `nchar(n)` | Unicode fixed string | Fixed unicode text |
| `text` | `text` | Large text (deprecated) | Use varchar(MAX) instead |
| `ntext` | `ntext` | Large unicode (deprecated) | Use varchar(MAX) instead |
| `date` | `date` | Date only | Birth dates, deadlines |
| `time` | `time` | Time only | Business hours |
| `datetime` | `datetime` | Date and time | Legacy datetime |
| `datetime2` | `datetime2` | Date and time (recommended) | Timestamps, created_at |
| `datetimeoffset` | `datetimeoffset` | Date/time with timezone | International timestamps |
| `smalldatetime` | `smalldatetime` | Date/time (less precise) | Less precise timestamps |
| `uniqueidentifier` | `uniqueidentifier` | GUID/UUID | Unique identifiers |
| `binary` | `binary(n)` | Fixed binary | Binary data |
| `varbinary` | `varbinary(n)` | Variable binary | Files, images |
| `image` | `image` | Large binary (deprecated) | Use varbinary(MAX) |
| `xml` | `xml` | XML data | XML documents |
| `hierarchyid` | `hierarchyid` | Hierarchical data | Tree structures |
| `geometry` | `geometry` | Spatial data | Geometric shapes |
| `geography` | `geography` | Geographic data | GPS coordinates |

### Recommended Types for Common Scenarios

```typescript
// Primary Keys
@PrimaryGeneratedColumn()
id: number; // int with IDENTITY

@PrimaryGeneratedColumn('uuid')
id: string; // uniqueidentifier

// Strings
@Column({ type: 'varchar', length: 255 })
name: string; // Short text, supports Unicode

@Column({ type: 'varchar', length: 'MAX' })
description: string; // Long text, supports Unicode

@Column({ type: 'varchar', length: 100 })
code: string; // Short ASCII-only text

// Numbers
@Column({ type: 'int' })
count: number;

@Column({ type: 'bigint' })
largeNumber: number;

@Column({ type: 'decimal', precision: 10, scale: 2 })
price: number; // For currency/precise values

@Column({ type: 'float' })
rating: number; // For approximate values

// Boolean
@Column({ type: 'bit' })
isActive: boolean;

// Dates
@CreateDateColumn({ type: 'datetime2' })
createdAt: Date;

@UpdateDateColumn({ type: 'datetime2' })
updatedAt: Date;

@Column({ type: 'date' })
birthDate: Date;

@Column({ type: 'datetimeoffset' })
scheduledAt: Date; // With timezone

// UUID
@Column({ type: 'uniqueidentifier' })
uuid: string;

// JSON (stored as string)
@Column({ type: 'varchar', length: 'MAX' })
metadata: string; // Store JSON.stringify() data

// Enum (stored as int or string)
@Column({ type: 'varchar', length: 50 })
status: 'active' | 'inactive' | 'pending';

// Binary Data
@Column({ type: 'varbinary', length: 'MAX' })
fileData: Buffer;
```

---

## Setting Up Entities

### Example Entity with All Common Types

**File: `src/entities/user.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'varchar', length: 'MAX', nullable: true })
  bio: string;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;

  @Column({ type: 'datetime2', nullable: true })
  lastLoginAt: Date;
}
```

### Example with Relations

**File: `src/entities/post.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 'MAX' })
  content: string;

  @Column({ type: 'bit', default: false })
  isPublished: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  userId: number;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}
```

### Register Entities in Module

**File: `src/users/users.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## Migrations

### Setup TypeORM CLI

**File: `ormconfig.ts`** (root directory)

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA || 'dbo',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/**/*{.ts,.js}'],
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
});
```

### Add Migration Scripts

**File: `package.json`**

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs -d ormconfig.ts",
    "migration:generate": "npm run typeorm -- migration:generate ./src/migrations/$npm_config_name",
    "migration:create": "npm run typeorm -- migration:create ./src/migrations/$npm_config_name",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show"
  }
}
```

### Generate Migration

```bash
# Generate migration based on entity changes
npm run migration:generate --name=InitialSchema

# Or create empty migration
npm run migration:create --name=AddUserTable
```

### Run Migrations

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Example Migration File

**File: `src/migrations/1234567890-InitialSchema.ts`**

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialSchema1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'isActive',
            type: 'bit',
            default: 1,
          },
          {
            name: 'createdAt',
            type: 'datetime2',
            default: 'GETDATE()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

---

## Azure SQL Database Deployment

### What is Azure SQL Database?

**Azure SQL Database** is Microsoft's fully managed relational database service (PaaS) based on SQL Server. It's the recommended option for MSSQL on Azure.

### Azure Database Options

| Service | Best For | Notes |
|---------|----------|-------|
| **Azure SQL Database** | Most applications | Fully managed, auto-scaling, serverless option available |
| **Azure SQL Managed Instance** | Enterprise, lift-and-shift | 99% SQL Server compatibility |
| **SQL Server on Azure VM** | Full control needed | IaaS, you manage everything |

**Recommendation**: Use **Azure SQL Database** for most NestJS applications.

### Step-by-Step Azure Deployment

#### 1. Create Azure SQL Database

**Via Azure Portal:**

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "SQL Database"
4. Click "Create"
5. Fill in:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new or use existing
   - **Database Name**: `my-app-db`
   - **Server**: Create new server
     - Server name: `my-app-server` (must be globally unique)
     - Location: Choose closest region
     - Authentication: SQL authentication
     - Admin login: `sqladmin`
     - Password: Strong password
   - **Compute + Storage**: Choose tier (Basic, Standard, or Premium)
     - Start with: Standard S0 (10 DTUs) for development
     - Or: Serverless for variable workloads
6. Click "Review + Create"

**Via Azure CLI:**

```bash
# Login
az login

# Create resource group
az group create --name myResourceGroup --location eastus

# Create SQL server
az sql server create \
  --name my-app-server \
  --resource-group myResourceGroup \
  --location eastus \
  --admin-user sqladmin \
  --admin-password YourPassword123!

# Create database
az sql db create \
  --name my-app-db \
  --resource-group myResourceGroup \
  --server my-app-server \
  --service-objective S0
```

#### 2. Configure Firewall Rules

**Allow Azure Services:**

```bash
az sql server firewall-rule create \
  --resource-group myResourceGroup \
  --server my-app-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

**Allow Your IP (for development):**

```bash
az sql server firewall-rule create \
  --resource-group myResourceGroup \
  --server my-app-server \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

**Or via Portal:**
- Go to SQL Server → Networking
- Add your client IP address
- Enable "Allow Azure services and resources to access this server"

#### 3. Get Connection String

**From Azure Portal:**
- Go to SQL Database → Settings → Connection strings
- Copy the ADO.NET connection string

**Example connection string:**
```
Server=tcp:my-app-server.database.windows.net,1433;Initial Catalog=my-app-db;Persist Security Info=False;User ID=sqladmin;Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

#### 4. Update Environment Variables

**Production `.env` file:**

```env
DB_HOST=my-app-server.database.windows.net
DB_PORT=1433
DB_USERNAME=sqladmin
DB_PASSWORD=YourPassword123!
DB_NAME=my-app-db
DB_SCHEMA=dbo
DB_ENCRYPT=true
DB_TRUST_CERT=false
DB_SYNC=false
DB_LOGGING=false
```

#### 5. Test Connection Locally

```bash
# Install dependencies
npm install

# Test connection
npm run start:dev
```

#### 6. Deploy NestJS Application

**Option A: Azure App Service**

```bash
# Create App Service plan
az appservice plan create \
  --name myAppServicePlan \
  --resource-group myResourceGroup \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --name my-nestjs-app \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --runtime "NODE|18-lts"

# Configure environment variables
az webapp config appsettings set \
  --name my-nestjs-app \
  --resource-group myResourceGroup \
  --settings \
    DB_HOST=my-app-server.database.windows.net \
    DB_PORT=1433 \
    DB_USERNAME=sqladmin \
    DB_PASSWORD=YourPassword123! \
    DB_NAME=my-app-db \
    DB_ENCRYPT=true

# Deploy (using GitHub Actions or Azure DevOps recommended)
```

**Option B: Azure Container Instances**

```bash
# Build and push Docker image
docker build -t my-nestjs-app .
docker tag my-nestjs-app myregistry.azurecr.io/my-nestjs-app
docker push myregistry.azurecr.io/my-nestjs-app

# Deploy container
az container create \
  --name my-nestjs-app \
  --resource-group myResourceGroup \
  --image myregistry.azurecr.io/my-nestjs-app \
  --cpu 1 --memory 1 \
  --environment-variables \
    DB_HOST=my-app-server.database.windows.net \
    DB_ENCRYPT=true
```

#### 7. Run Migrations on Azure

**Connect to Azure SQL:**

```bash
# Set environment to production
export NODE_ENV=production

# Run migrations
npm run migration:run
```

**Or use SQL Server Management Studio (SSMS):**
- Connect to: `my-app-server.database.windows.net`
- Login with: `sqladmin` and password
- Run migration scripts manually

---

## Common Issues & Solutions

### Issue 1: Connection Timeout

**Error:** `ConnectionError: Failed to connect to localhost:1433`

**Solutions:**
```env
# Increase timeout
DB_CONNECTION_TIMEOUT=30000

# Check SQL Server is running
# For local: Start SQL Server service
# For Azure: Check firewall rules
```

### Issue 2: Login Failed

**Error:** `Login failed for user 'username'`

**Solutions:**
- Verify username and password
- Check SQL Server authentication mode (should be mixed mode)
- For Azure: Check firewall allows your IP

### Issue 3: SSL/TLS Certificate Error

**Error:** `Self signed certificate`

**Solutions:**
```env
# For local development
DB_TRUST_CERT=true

# For Azure (must be false)
DB_TRUST_CERT=false
DB_ENCRYPT=true
```

### Issue 4: Named Instance Connection

**Error:** Can't connect to named instance

**Solution:**
```env
# Use instance name instead of port
DB_INSTANCE_NAME=SQLEXPRESS
# Remove or comment out DB_PORT
```

### Issue 5: Column Type Mismatch

**Error:** `Invalid column type`

**Solution:**
- Use MSSQL-specific types: `varchar`, `datetime2`, `bit`
- Avoid PostgreSQL-specific types: `text`, `boolean`, `timestamp`

### Issue 6: Azure SQL Blocks Connection

**Error:** `Cannot open server 'xxx' requested by the login`

**Solutions:**
1. Add firewall rule for your IP
2. Enable "Allow Azure services"
3. Check NSG (Network Security Group) rules
4. Verify connection string is correct

### Issue 7: Migration Fails

**Error:** Various migration errors

**Solutions:**
```bash
# Check migration status
npm run migration:show

# Revert if needed
npm run migration:revert

# Re-generate migration
npm run migration:generate --name=FixSchema
```

---

## Best Practices

### 1. Security
- ✅ Use environment variables for credentials
- ✅ Never commit `.env` to version control
- ✅ Use Azure Key Vault for production secrets
- ✅ Enable encryption (`encrypt: true`) for Azure
- ✅ Use strong passwords
- ✅ Implement proper firewall rules

### 2. Performance
- ✅ Use connection pooling
- ✅ Add indexes to frequently queried columns
- ✅ Use `varchar` only when Unicode needed (varchar is faster)
- ✅ Set appropriate `requestTimeout` values
- ✅ Monitor DTU usage on Azure

### 3. Development
- ✅ Never use `synchronize: true` in production
- ✅ Always use migrations
- ✅ Test migrations locally first
- ✅ Keep entity definitions clean and typed
- ✅ Use TypeScript strict mode

### 4. Azure Specific
- ✅ Choose right pricing tier (start small, scale up)
- ✅ Enable automated backups
- ✅ Use serverless for variable workloads
- ✅ Monitor performance metrics
- ✅ Set up alerts for failures

---

## Testing Your Setup

### Create a Test Service

**File: `src/users/users.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(name: string, email: string): Promise<User> {
    const user = this.usersRepository.create({ name, email });
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.usersRepository.findOne({ where: { id } });
  }
}
```

### Test Controller

**File: `src/users/users.controller.ts`**

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: { name: string; email: string }) {
    return this.usersService.create(body.name, body.email);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
```

### Run Tests

```bash
# Start application
npm run start:dev

# Test endpoints
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

curl http://localhost:3000/users
```

---

## Useful Resources

- [TypeORM Documentation](https://typeorm.io/)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [Azure SQL Database Documentation](https://docs.microsoft.com/en-us/azure/azure-sql/)
- [MSSQL npm Package](https://www.npmjs.com/package/mssql)
- [SQL Server Data Types](https://docs.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql)

---

## Quick Start Checklist

- [ ] Install packages: `npm install @nestjs/typeorm typeorm mssql`
- [ ] Create `database.module.ts`
- [ ] Set up `.env` file with database credentials
- [ ] Create entity files with proper MSSQL types
- [ ] Set up `ormconfig.ts` for migrations
- [ ] Generate initial migration
- [ ] Run migrations
- [ ] Test CRUD operations
- [ ] Deploy to Azure (if needed)
- [ ] Configure firewall rules
- [ ] Monitor and optimize

---

**Need help?** Check the [Common Issues](#common-issues--solutions) section or consult the official documentation links above.