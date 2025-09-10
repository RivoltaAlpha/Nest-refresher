# TypeORM - Getting Started Guide

TypeORM is a powerful Object-Relational Mapping (ORM) library for TypeScript and JavaScript that allows you to work with databases using object-oriented programming. This guide will walk you through setting up TypeORM from scratch and creating your first entities.

## Table of Contents
- [Installation](#installation)
- [TypeScript Configuration](#typescript-configuration)
- [Quick Start](#quick-start)
- [Understanding Entities](#understanding-entities)
- [Working with Columns](#working-with-columns)
- [DataSource Configuration](#datasource-configuration)
- [Column Types Reference](#column-types-reference)
- [Advanced Features](#advanced-features)

## Installation

### 1. Install TypeORM
```bash
npm install typeorm
```

### 2. Install Node.js Type Definitions
```bash
npm install @types/node --save-dev
```

### 3. Install Database Driver
Choose and install the appropriate database driver for your project:

```bash
# PostgreSQL
npm install pg

# MySQL/MariaDB
npm install mysql2

# Microsoft SQL Server
npm install mssql

# SQLite
npm install sqlite3

# MongoDB
npm install mongodb

# Oracle
npm install oracledb
```

## TypeScript Configuration

Ensure you're using TypeScript version 4.5 or higher and add these settings to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

## Quick Start

### Step 1: Create Your First Entity

Start by creating a simple entity. An entity represents a database table:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    filename: string

    @Column()
    views: number

    @Column()
    isPublished: boolean
}
```

### Step 2: Configure DataSource

Create your database connection configuration:

```typescript
import { DataSource } from "typeorm"
import { Photo } from "./entity/Photo"

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "your_username",
    password: "your_password",
    database: "your_database",
    entities: [Photo],
    synchronize: true, // Don't use in production
    logging: false,
})

// Initialize the connection
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
```

### Step 3: Use Your Entity

```typescript
import { AppDataSource } from "./data-source"
import { Photo } from "./entity/Photo"

// Create a new photo
const photo = new Photo()
photo.name = "Sunset"
photo.description = "Beautiful sunset over the mountains"
photo.filename = "sunset.jpg"
photo.views = 0
photo.isPublished = true

// Save to database
await AppDataSource.manager.save(photo)

// Find photos
const allPhotos = await AppDataSource.manager.find(Photo)
const firstPhoto = await AppDataSource.manager.findOneBy(Photo, { id: 1 })
```

## Understanding Entities

### What is an Entity?
An entity is a class that maps to a database table. Each entity must:
- Be decorated with `@Entity()`
- Have at least one primary key column
- Have properties decorated with `@Column()` for database columns

### Basic Entity Structure
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    isActive: boolean
}
```

This creates a database table like:
```
+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| firstName   | varchar(255) |                            |
| lastName    | varchar(255) |                            |
| isActive    | boolean      |                            |
+-------------+--------------+----------------------------+
```

## Working with Columns

### Primary Columns
Every entity must have at least one primary column:

#### Auto-Generated Primary Key (Recommended)
```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number // Auto-incremented integer
}
```

#### UUID Primary Key
```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string // Auto-generated UUID
}
```

#### Manual Primary Key
```typescript
@Entity()
export class User {
    @PrimaryColumn()
    id: number // You must set this manually
}
```

#### Composite Primary Keys
```typescript
@Entity()
export class UserProfile {
    @PrimaryColumn()
    userId: number

    @PrimaryColumn()
    profileType: string
}
```

### Column Data Types

#### Basic Types with Options
```typescript
@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        length: 100, // varchar(100)
    })
    title: string

    @Column("text") // Long text
    content: string

    @Column("double") // Decimal number
    rating: number

    @Column({
        default: true, // Default value
        nullable: false // NOT NULL constraint
    })
    isPublished: boolean
}
```

### Special Column Types

#### Timestamps
```typescript
@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn() // Automatically set on creation
    createdAt: Date

    @UpdateDateColumn() // Automatically updated on save
    updatedAt: Date

    @DeleteDateColumn() // Set when soft-deleted
    deletedAt: Date

    @VersionColumn() // Incremented on each update
    version: number
}
```

#### Enums
```typescript
export enum UserRole {
    ADMIN = "admin",
    EDITOR = "editor",
    VIEWER = "viewer",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.VIEWER,
    })
    role: UserRole
}
```

#### Arrays and JSON
```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column("simple-array") // Stored as comma-separated string
    tags: string[]

    @Column("simple-json") // Stored as JSON string
    profile: { bio: string; avatar: string }
}
```

## DataSource Configuration

The DataSource holds your database connection settings:

```typescript
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres", // Database type
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "myapp",
    
    // Entity configuration
    entities: ["src/entity/**/*.ts"], // Path to entities
    
    // Development settings
    synchronize: true, // Auto-create tables (disable in production)
    logging: true, // Log SQL queries
    
    // Connection pool settings
    extra: {
        connectionLimit: 10,
    },
})
```

### Environment-Based Configuration
```typescript
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Photo, Article],
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV === "development",
})
```

## Column Types Reference

### Common Column Options
```typescript
@Column({
    type: "varchar",           // Explicit type
    length: 150,              // Length for varchar
    unique: true,             // Unique constraint
    nullable: false,          // NOT NULL
    default: "default_value", // Default value
    name: "custom_name",      // Custom column name
    select: false,            // Exclude from queries by default
    insert: false,            // Don't insert this column
    update: false,            // Don't update this column
    comment: "User's email",  // Column comment
})
email: string
```

### Numeric Types
```typescript
@Column("int")           // Integer
@Column("bigint")        // Big integer (returns string)
@Column("decimal", { precision: 10, scale: 2 }) // Decimal with precision
@Column("double")        // Double precision
@Column("real")          // Real number
```

### String Types
```typescript
@Column("varchar", { length: 255 })  // Variable character
@Column("char", { length: 10 })      // Fixed character
@Column("text")                      // Long text
```

### Date Types
```typescript
@Column("date")          // Date only
@Column("time")          // Time only
@Column("datetime")      // Date and time
@Column("timestamp")     // Timestamp
```

## Advanced Features

### Generated Columns
```typescript
@Entity()
export class User {
    @PrimaryColumn()
    id: number

    @Column()
    @Generated("uuid") // Auto-generate UUID
    uuid: string

    @Column()
    @Generated("increment") // Auto-increment
    serialNumber: number
}
```

### Spatial Columns (PostGIS, MySQL)
```typescript
@Entity()
export class Location {
    @PrimaryGeneratedColumn()
    id: number

    @Column("point")
    coordinates: string // "POINT(1 1)"

    @Column("polygon")
    area: string // "POLYGON((0 0,1 0,1 1,0 1,0 0))"
}
```

### Custom Transformers
```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        transformer: {
            to: (value: string) => value.toLowerCase(),
            from: (value: string) => value.toUpperCase()
        }
    })
    name: string
}
```

## Best Practices

1. **Use TypeScript**: Leverage type safety for better development experience
2. **Environment Configuration**: Use environment variables for database settings
3. **Disable Synchronize in Production**: Never use `synchronize: true` in production
4. **Use Migrations**: Use TypeORM migrations for production database changes
5. **Connection Pooling**: Configure appropriate connection pool settings
6. **Indexing**: Add database indexes for frequently queried columns
7. **Validation**: Use class-validator for input validation

## Next Steps

- Learn about [Relations](https://typeorm.io/relations) (one-to-one, one-to-many, many-to-many)
- Explore [Query Builder](https://typeorm.io/query-builder) for complex queries
- Set up [Migrations](https://typeorm.io/migrations) for database versioning
- Implement [Repository Pattern](https://typeorm.io/working-with-repository) for data access
- Add [Validation](https://typeorm.io/validation) to your entities

For more detailed documentation, visit the [official TypeORM documentation](https://typeorm.io/).