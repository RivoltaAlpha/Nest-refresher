# CRUD Operations & DTO Integration Guide

## 📚 Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
4. [CRUD Operations](#crud-operations)
5. [Validation](#validation)
6. [Error Handling](#error-handling)
7. [API Testing](#api-testing)
8. [Best Practices](#best-practices)

## 🎯 Overview

This guide covers the implementation of CRUD (Create, Read, Update, Delete) operations with proper DTO validation in a NestJS Event Management System. The system manages Users, Events, Registrations, Payments, and Feedback with proper relationships and validation.

### Key Technologies
- **NestJS** - Framework
- **TypeORM** - Database ORM
- **class-validator** - Validation
- **class-transformer** - Data transformation
- **Swagger** - API documentation

## 📁 Project Structure

```
src/
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   └── users.service.ts
├── events/
│   ├── dto/
│   │   ├── create-event.dto.ts
│   │   └── update-event.dto.ts
│   ├── entities/
│   │   └── event.entity.ts
│   ├── events.controller.ts
│   └── events.service.ts
└── ... (similar structure for registrations, payments, feedback)
```

## 📋 DTOs (Data Transfer Objects)

DTOs define the shape of data for API requests and responses. They include validation rules and API documentation.

### Create DTO Example (Users)

```typescript
// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.User })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

### Update DTO Example

```typescript
// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### Key DTO Concepts:

1. **Required vs Optional Fields**:
   - `@IsNotEmpty()` - Field is required
   - `@IsOptional()` - Field is optional

2. **Validation Decorators**:
   - `@IsEmail()` - Validates email format
   - `@MinLength(6)` - Minimum string length
   - `@IsEnum(UserRole)` - Must be one of enum values
   - `@IsNumber()` - Must be a number
   - `@IsDateString()` - Must be a valid date string

3. **API Documentation**:
   - `@ApiProperty()` - Required field in Swagger
   - `@ApiPropertyOptional()` - Optional field in Swagger

## 🔄 CRUD Operations

### Service Layer Implementation

The service layer contains business logic and database operations with proper error handling.

```typescript
// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email }
      });
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        relations: ['events', 'registrations', 'feedback']
      });
    } catch (error) {
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: id },
        relations: ['events', 'registrations', 'feedback']
      });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOne(id); // This throws NotFoundException if not found
      
      // Check email conflict if email is being updated
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email }
        });
        
        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }
      }

      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const user = await this.findOne(id); // This throws NotFoundException if not found
      await this.userRepository.remove(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
```

### Controller Layer Implementation

Controllers handle HTTP requests and delegate to services.

```typescript
// src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User with email already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }
}
```

## ✅ Validation

### Global Validation Pipe

Enable validation globally in `main.ts`:

```typescript
// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error for unknown properties
    transform: true, // Transform payloads to DTO instances
  }));
  
  await app.listen(3000);
}
bootstrap();
```

### Common Validation Decorators

| Decorator | Purpose | Example |
|-----------|---------|---------|
| `@IsNotEmpty()` | Field cannot be empty | Required fields |
| `@IsOptional()` | Field is optional | Optional fields |
| `@IsEmail()` | Valid email format | Email validation |
| `@MinLength(6)` | Minimum string length | Password validation |
| `@MaxLength(255)` | Maximum string length | Text limits |
| `@IsNumber()` | Must be a number | Numeric fields |
| `@IsEnum(UserRole)` | Must be enum value | Role validation |
| `@IsDateString()` | Valid ISO date string | Date validation |

## 🚨 Error Handling

### HTTP Exception Types

```typescript
import { 
  ConflictException,    // 409 - Resource conflict
  NotFoundException,    // 404 - Resource not found
  BadRequestException,  // 400 - Invalid request
  UnauthorizedException, // 401 - Authentication required
  ForbiddenException,   // 403 - Access denied
  HttpException,        // Generic HTTP exception
  HttpStatus 
} from '@nestjs/common';
```

### Error Handling Patterns

1. **Conflict Handling** (409):
   ```typescript
   if (existingUser) {
     throw new ConflictException('User with this email already exists');
   }
   ```

2. **Not Found Handling** (404):
   ```typescript
   if (!user) {
     throw new NotFoundException(`User with ID ${id} not found`);
   }
   ```

3. **Generic Error Handling** (500):
   ```typescript
   catch (error) {
     if (error instanceof ConflictException || error instanceof NotFoundException) {
       throw error; // Re-throw known exceptions
     }
     throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
   }
   ```

## 🧪 API Testing

### Using HTTP Files

Create `test.http` for API testing:

```http
### Create User
POST http://localhost:3000/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "User"
}

### Get All Users
GET http://localhost:3000/users

### Get User by ID
GET http://localhost:3000/users/1

### Update User
PATCH http://localhost:3000/users/1
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+9876543210"
}

### Delete User
DELETE http://localhost:3000/users/1
```

### Using cURL

```bash
# Create User
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
  }'

# Get All Users
curl -X GET http://localhost:3000/users

# Get User by ID
curl -X GET http://localhost:3000/users/1

# Update User
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Updated"}'

# Delete User
curl -X DELETE http://localhost:3000/users/1
```

## 📝 Best Practices

### 1. DTO Design
- ✅ Use specific DTOs for create and update operations
- ✅ Include validation decorators
- ✅ Add API documentation with `@ApiProperty`
- ✅ Use `PartialType()` for update DTOs
- ❌ Don't include auto-generated fields (id, timestamps) in create DTOs

### 2. Service Layer
- ✅ Always use try-catch blocks
- ✅ Check for existing resources before creating
- ✅ Throw appropriate HTTP exceptions
- ✅ Use database transactions for complex operations
- ❌ Don't catch and ignore errors silently

### 3. Controller Layer
- ✅ Use proper HTTP status codes
- ✅ Add API documentation
- ✅ Use `ParseIntPipe` for ID parameters
- ✅ Let services handle business logic
- ❌ Don't put business logic in controllers

### 4. Validation
- ✅ Enable global validation pipe
- ✅ Use whitelist and forbidNonWhitelisted options
- ✅ Validate all input data
- ✅ Transform data types when needed
- ❌ Don't trust client input without validation

### 5. Error Messages
- ✅ Provide clear, actionable error messages
- ✅ Use consistent error response format
- ✅ Include relevant context in error messages
- ❌ Don't expose sensitive internal information

### 6. Database Relations
- ✅ Map DTO numeric IDs to entity relations
- ✅ Use proper foreign key constraints
- ✅ Load relations when needed
- ❌ Don't expose raw database errors to clients

## 🔗 Entity Relationships

### Mapping DTOs to Relations

When DTOs contain foreign key IDs, map them to entity relations:

```typescript
// DTO has: event_id: number
// Entity expects: event: Event

async create(createRegistrationDto: CreateRegistrationDto): Promise<Registration> {
  try {
    const registration = this.registrationRepository.create({
      ...createRegistrationDto,
      // Map foreign key IDs to relations
      user: createRegistrationDto.user_id ? { user_id: createRegistrationDto.user_id } : undefined,
      event: createRegistrationDto.event_id ? { event_id: createRegistrationDto.event_id } : undefined,
    });
    
    return await this.registrationRepository.save(registration);
  } catch (error) {
    throw new HttpException('Failed to create registration', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
```

## 🎓 Learning Exercises

1. **Add Validation**: Implement custom validators for business rules
2. **Error Handling**: Add logging to error handlers
3. **Testing**: Write unit tests for services
4. **Documentation**: Enhance Swagger documentation
5. **Performance**: Add pagination to list endpoints
6. **Security**: Implement authentication and authorization

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI Documentation](https://swagger.io/docs/)

---

Happy coding! 🚀