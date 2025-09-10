# Building an Event Management API with NestJS: A Complete Tutorial
This tutorial will guide you through building a robust Event Management API using NestJS, TypeORM, and PostgreSQL. We will cover essential concepts and best practices to create a scalable and maintainable application.

## 📚 Table of Contents
-   [Introduction](./docs/01-Nest-architecture.md)  
-   [Controllers](./docs/02-Controllers.md)  
-   [Providers](./docs/03-Providers.md) 
-   [Modules](./docs/04-Modules.md)
-   [Middleware](./docs/05-Middleware.md)
-   [Exception Filters](./docs/06-Exception-filters.md)
-   [Pipes](./docs/07-Pipes.md)
-   [Guards](./docs/08-Guards.md)
-   [Database Integration](./docs/09-Database-integration.md)
-   [Relations](./docs/09-Relationships.md)
-   [TypeORM](./docs/09-TypeORM.md)
-   [Logging](./docs/10-logging-error-handling.md)
-   [Repository Pattern](./docs/11-Repository-pattern.md)
-   [Seeding](./docs/12-Seeding.md)
-   [Caching](./docs/13-Caching.md)
-   [Authentication](./docs/14-authentication.md)
-   [Authorization](./docs/15-authorization.md)
-   [Swagger](./docs/16-swagger.md)


## 🏗️ Project Overview
Features:
- User authentication and role management
- Event creation and management
- Event registration system
- Feedback and rating system
- Payment integration ready
- Admin dashboard capabilities

### System Roles
- **Admin**: Full system control
- **Organizer**: Can create and manage events
- **User**: Can register for events and provide feedback
- **Guest**: Limited access for browsing events

---

## 🚀 Getting Started

### Prerequisites
- Node.js 
- PostgreSQL database
- Basic TypeScript knowledge

### 1. Project Setup

Install NestJS CLI globally:
```bash
npm install -g @nestjs/cli
```

Create a new project:
```bash
nest new event-management-api
cd event-management-api
```

Install required dependencies:
```bash
pnpm install @nestjs/typeorm typeorm pg @nestjs/passport passport @nestjs/jwt passport-jwt @nestjs/swagger swagger-ui-express class-validator class-transformer bcryptjs
pnpm install -D @types/passport-jwt @types/bcryptjs @nestjs/config dotenv
```
-- Set-up the database
Database-Integration.md

## 👤 Building the User Module

### 1. Generate the User Resource

```bash
nest generate resource users --no-spec
```

### 2. Create User Entity

**src/users/entities/user.entity.ts**
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 3. Create User Role Enum

**src/users/enums/user-role.enum.ts**
```typescript
export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  ORGANIZER = 'Organizer',
  GUEST = 'Guest',
}
```

### 4. Create DTOs with Validation

**src/users/dto/create-user.dto.ts**
```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

**src/users/dto/update-user.dto.ts**
```typescript
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const)
) {}
```

### 5. Implement User Service

**src/users/users.service.ts**
```typescript
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'phone', 'role', 'created_at'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'phone', 'role', 'created_at'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
```

---

## 🔐 Authentication Module

### 1. Generate Auth Module

```bash
nest generate module auth
nest generate service auth --no-spec
nest generate controller auth --no-spec
```

### 2. Create Auth DTOs

**src/auth/dto/login.dto.ts**
```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
```

**src/auth/dto/register.dto.ts**
```typescript
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {}
```

### 3. Implement JWT Strategy

**src/auth/strategies/jwt.strategy.ts**
```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}
```

### 4. Create Guards

**src/auth/guards/jwt-auth.guard.ts**
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**src/auth/guards/roles.guard.ts**
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
```

### 5. Create Roles Decorator

**src/auth/decorators/roles.decorator.ts**
```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

---

## 🎪 Events Module

### 1. Generate Events Resource

```bash
nest generate resource events --no-spec
```

### 2. Create Event Entity

**src/events/entities/event.entity.ts**
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  event_name: string;

  @Column('timestamp')
  event_date: Date;

  @Column()
  event_location: string;

  @Column('text')
  event_description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 100 })
  max_capacity: number;

  @Column({ default: 0 })
  current_registrations: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  organizer: User;

  @Column()
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 3. Create Event DTOs

**src/events/dto/create-event.dto.ts**
```typescript
import { IsNotEmpty, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty()
  @IsNotEmpty()
  event_name: string;

  @ApiProperty()
  @IsDateString()
  event_date: string;

  @ApiProperty()
  @IsNotEmpty()
  event_location: string;

  @ApiProperty()
  @IsNotEmpty()
  event_description: string;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiProperty({ default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  max_capacity?: number;
}
```

---

## 📝 Registration Module

### 1. Generate Registration Resource

```bash
nest generate resource registrations --no-spec
```

### 2. Create Registration Entity

**src/registrations/entities/registration.entity.ts**
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum PaymentStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

@Entity('event_registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column()
  event_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @CreateDateColumn()
  registration_date: Date;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  payment_amount: number;
}
```

---

## 🔧 Main Application Setup

### Update main.ts with Global Configuration

**src/main.ts**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Event Management API')
    .setDescription('A comprehensive event management system API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
}
bootstrap();
```

---

## 🧪 Testing Your API

### Environment Variables

Create a **.env** file:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=event_management

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Running the Application

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Testing Endpoints

1. **Register a new user**: `POST /auth/register`
2. **Login**: `POST /auth/login`
3. **Create an event** (Organizer): `POST /events`
4. **Register for event** (User): `POST /registrations`
5. **View events**: `GET /events`

---

## 🚀 Advanced Features

### 1. Implement Feedback Module
- Create feedback entity and DTOs
- Add rating system (1-5 stars)
- Generate feedback analytics

### 2. Add File Upload
- Event images and documents
- User profile pictures
- Use Multer for file handling

### 3. Email Notifications
- Registration confirmations
- Event reminders
- Feedback requests

### 4. Payment Integration
- Stripe or PayPal integration
- Webhook handling for payment status

### 5. Real-time Features
- WebSocket for live event updates
- Real-time registration counts
- Live chat for events

---

## 📊 Best Practices Implemented

1. **Modular Architecture**: Clean separation of concerns
2. **Security**: JWT authentication, password hashing, role-based access
3. **Validation**: Comprehensive input validation using DTOs
4. **Error Handling**: Proper HTTP status codes and error messages
5. **Documentation**: Auto-generated Swagger documentation
6. **Database Relations**: Proper foreign keys and relationships
7. **Environment Configuration**: Configurable for different environments

---

## 🎯 Next Steps

1. Add comprehensive unit and integration tests
2. Implement caching with Redis
3. Add rate limiting for API endpoints
4. Set up CI/CD pipeline
5. Deploy to cloud platforms (AWS, Azure, GCP)
6. Add monitoring and logging
7. Implement advanced search and filtering
8. Add GraphQL support

---

## 📚 Additional Resources

- [NestJS Official Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

This tutorial provides a solid foundation for building scalable APIs with NestJS. Each module can be extended with additional features as your application grows!