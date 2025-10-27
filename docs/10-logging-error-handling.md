### Service with Logging

```typescript
// src/post/post.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { User } from '../user/entities/user.entity';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private logger: LoggerService,
  ) {}

  async create(createPostDto: CreatePostDto, user: User, ip: string): Promise<Post> {
    this.logger.log(
      `User ${user.id} creating new post: "${createPostDto.title}"`,
      'PostService',
      ip,
    );

    try {
      const post = this.postRepository.create({
        ...createPostDto,
        author: user,
      });

      const savedPost = await this.postRepository.save(post);
      
      this.logger.database('INSERT', 'Post', 'PostService', ip);
      this.logger.log(
        `Post created successfully: ${savedPost.id}`,
        'PostService',
        ip,
      );

      return savedPost;
    } catch (error) {
      this.logger.error(
        `Failed to create post: ${error.message}`,
        'PostService',
        ip,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(query: QueryPostDto, ip: string): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
    this.logger.database('SELECT', 'Post (with pagination)', 'PostService', ip);

    const { page = 1, limit = 10, isPublished } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .skip(skip)
      .take(limit)
      .orderBy('post.createdAt', 'DESC');

    if (isPublished !== undefined) {
      queryBuilder.where('post.isPublished = :isPublished', { isPublished });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    this.logger.log(
      `Retrieved ${data.length} posts (Total: ${total})`,
      'PostService',
      ip,
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number, ip: string): Promise<Post> {
    this.logger.database('SELECT', `Post id:${id}`, 'PostService', ip);

    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      this.logger.warn(`Post not found: ${id}`, 'PostService', ip);
      throw new NotFoundException(`Post #${id} not found`);
    }

    return post;
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    user: User,
    ip: string,
  ): Promise<Post> {
    this.logger.log(`User ${user.id} updating post: ${id}`, 'PostService', ip);

    const post = await this.findOne(id, ip);

    // Check ownership (unless admin)
    const isAdmin = user.roles.some((role) => role.name === 'admin');
    if (post.author.id !== user.id && !isAdmin) {
      this.logger.warn(
        `User ${user.id} attempted to update post ${id} without permission`,
        'PostService',
        ip,
      );
      throw new ForbiddenException('You can only edit your own posts');
    }

    try {
      Object.assign(post, updatePostDto);
      const updatedPost = await this.postRepository.save(post);

      this.logger.database('UPDATE', `Post id:${id}`, 'PostService', ip);
      this.logger.log(`Post updated successfully: ${id}`, 'PostService', ip);

      return updatedPost;
    } catch (error) {
      this.logger.error(
        `Failed to update post ${id}: ${error.message}`,
        'PostService',
        ip,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: number, user: User, ip: string): Promise<void> {
    this.logger.log(`User ${user.id} deleting post: ${id}`, 'PostService', ip);

    const post = await this.findOne(id, ip);

    // Check ownership (unless admin)
    const isAdmin = user.roles.some((role) => role.name === 'admin');
    if (post.author.id !== user.id && !isAdmin) {
      this.logger.warn(
        `User ${user.id} attempted to delete post ${id} without permission`,
        'PostService',
        ip,
      );
      throw new ForbiddenException('You can only delete your own posts');
    }

    try {
      await this.postRepository.remove(post);
      
      this.logger.database('DELETE', `Post id:${id}`, 'PostService', ip);
      this.logger.log(`Post deleted successfully: ${id}`, 'PostService', ip);
    } catch (error) {
      this.logger.error(
        `Failed to delete post ${id}: ${error.message}`,
        'PostService',
        ip,
        error.stack,
      );
      throw error;
    }
  }

  async publish(id: number, user: User, ip: string): Promise<Post> {
    this.logger.log(`User ${user.id} publishing post: ${id}`, 'PostService', ip);

    const post = await this.findOne(id, ip);

    // Check ownership
    if (post.author.id !== user.id) {
      throw new ForbiddenException('You can only publish your own posts');
    }

    post.isPublished = true;
    const publishedPost = await this.postRepository.save(post);

    this.logger.log(`Post published: ${id}`, 'PostService', ip);
    return publishedPost;
  }
}
```

### Controller with Guards and Pipes

```typescript
// src/post/post.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LoggerService } from '../logger/logger.service';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Must be authenticated
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
  ) {
    const ip = req.ip;
    const user = req.user;

    this.logger.log(
      `POST /posts - User: ${user.id}`,
      'PostController',
      ip,
    );

    return this.postService.create(createPostDto, user, ip);
  }

  @Get()
  async findAll(
    @Query() query: QueryPostDto,
    @Request() req,
  ) {
    const ip = req.ip;

    this.logger.log(
      `GET /posts - Query: ${JSON.stringify(query)}`,
      'PostController',
      ip,
    );

    return this.postService.findAll(query, ip);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const ip = req.ip;

    this.logger.log(
      `GET /posts/${id}`,
      'PostController',
      ip,
    );

    return this.postService.findOne(id, ip);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) // Must be authenticated (ownership checked in service)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    const ip = req.ip;
    const user = req.user;

    this.logger.log(
      `PATCH /posts/${id} - User: ${user.id}`,
      'PostController',
      ip,
    );

    return this.postService.update(id, updatePostDto, user, ip);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const ip = req.ip;
    const user = req.user;

    this.logger.log(
      `DELETE /posts/${id} - User: ${user.id}`,
      'PostController',
      ip,
    );

    await this.postService.remove(id, user, ip);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const ip = req.ip;
    const user = req.user;

    this.logger.log(
      `POST /posts/${id}/publish - User: ${user.id}`,
      'PostController',
      ip,
    );

    return this.postService.publish(id, user, ip);
  }

  // Admin-only route to get all posts including unpublished
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllForAdmin(
    @Query() query: QueryPostDto,
    @Request() req,
  ) {
    const ip = req.ip;
    const user = req.user;

    this.logger.log(
      `GET /posts/admin/all - Admin: ${user.id}`,
      'PostController',
      ip,
    );

    return this.postService.findAll(query, ip);
  }
}
```

### Module Configuration

```typescript
// src/post/post.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entities/post.entity';
import { LoggerModule } from '../logger/logger.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    LoggerModule,
    AuthModule, // For guards
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
```

---

## 6. Request Lifecycle with TypeORM

Here's the complete flow when a request comes in:

```
1. Incoming Request
        ↓
2. Middleware (CORS, body-parser, session, etc.)
        ↓
3. Guards (JwtAuthGuard checks token, loads user from DB)
        ↓
4. Guards (RolesGuard checks user.roles from DB)
        ↓
5. Interceptors (before) - can log, transform request
        ↓
6. Pipes (ValidationPipe validates DTO, Transform converts types)
        ↓
7. Custom Validators (IsUnique, Exists check database)
        ↓
8. Route Handler (Controller method executes)
        ↓
9. Service Layer (Business logic, TypeORM queries)
        ↓
10. TypeORM Repository (Database operations)
        ↓
11. Interceptors (after) - can transform response
        ↓
12. Exception Filter (if error occurs anywhere)
        ↓
13. Response sent to client
```

### Example Flow Diagram

```typescript
// Request: POST /posts with invalid data
// Headers: Authorization: Bearer <token>

// Step 1-2: Request enters NestJS pipeline

// Step 3: JwtAuthGuard
const token = extractToken(); // "abc123xyz"
const payload = jwtService.verify(token); // { sub: 5 }
const user = await userRepository.findOne({ 
  where: { id: 5 },
  relations: ['roles'] 
}); // User found with roles
request.user = user; // Attach to request
// ✓ Proceed

// Step 4: RolesGuard (if applied)
const requiredRoles = ['admin'];
const userRoles = user.roles.map(r => r.name); // ['user', 'moderator']
const hasRole = requiredRoles.some(r => userRoles.includes(r)); // false
// ✗ Throw ForbiddenException

// Step 12: AllExceptionsFilter catches ForbiddenException
logger.error('POST /posts - FORBIDDEN: User does not have required roles');
response = {
  statusCode: 403,
  timestamp: "2025-10-26T10:30:00Z",
  path: "/posts",
  errorCode: "ForbiddenException",
  message: "User does not have required roles: admin"
};
// Step 13: Send response to client
```

---

## 7. Advanced TypeORM Features with Guards & Pipes

### Query Builder Validation

```typescript
// src/post/dto/search-post.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum PostSortBy {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  UPDATED_AT = 'updatedAt',
}

export class SearchPostDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PostSortBy)
  sortBy?: PostSortBy = PostSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

```typescript
// In PostService
async search(searchDto: SearchPostDto, ip: string) {
  const { search, sortBy, sortOrder, page, limit } = searchDto;
  const skip = (page - 1) * limit;

  this.logger.log(
    `Searching posts: "${search}"`,
    'PostService',
    ip,
  );

  const queryBuilder = this.postRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.author', 'author')
    .where('post.isPublished = :isPublished', { isPublished: true });

  if (search) {
    queryBuilder.andWhere(
      '(post.title LIKE :search OR post.content LIKE :search)',
      { search: `%${search}%` },
    );
  }

  const [data, total] = await queryBuilder
    .orderBy(`post.${sortBy}`, sortOrder)
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  this.logger.database('SELECT', `Post (search results: ${total})`, 'PostService', ip);

  return { data, total, page, limit };
}
```

### Transaction Guard

Ensure operations happen in a transaction:

```typescript
// src/common/guards/transaction.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionGuard implements CanActivate {
  constructor(private dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Start a transaction and attach it to the request
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    request.queryRunner = queryRunner;

    return true;
  }
}

// Usage in controller
@Post('bulk-create')
@UseGuards(JwtAuthGuard, TransactionGuard)
async bulkCreate(@Body() data: CreatePostDto[], @Request() req) {
  const queryRunner = req.queryRunner;
  
  try {
    const posts = await this.postService.bulkCreate(data, queryRunner);
    await queryRunner.commitTransaction();
    return posts;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### Soft Delete with Pipes

```typescript
// Update entity to support soft deletes
@Entity('posts')
export class Post {
  // ... other fields

  @DeleteDateColumn()
  deletedAt?: Date;
}

// Service method
async softRemove(id: number, user: User, ip: string): Promise<void> {
  const post = await this.findOne(id, ip);

  if (post.author.id !== user.id) {
    throw new ForbiddenException('Cannot delete this post');
  }

  await this.postRepository.softDelete(id);
  this.logger.database('SOFT_DELETE', `Post id:${id}`, 'PostService', ip);
}

// Restore method
async restore(id: number, user: User, ip: string): Promise<Post> {
  await this.postRepository.restore(id);
  this.logger.database('RESTORE', `Post id:${id}`, 'PostService', ip);
  return this.findOne(id, ip);
}
```

---

## 9. Best Practices Summary

### Logging
1. ✅ Always inject LoggerService, never use `console.log`
2. ✅ Include context (class name) in all logs
3. ✅ Log IP addresses for audit trails
4. ✅ Use appropriate log levels (log, warn, error)
5. ✅ Log before and after database operations
6. ❌ Don't log sensitive data (passwords, tokens, API keys)
7. ❌ Don't log excessive detail in production

### Exception Handling
1. ✅ Use global exception filter for consistency
2. ✅ Handle TypeORM-specific errors (QueryFailedError, etc.)
3. ✅ Map database errors to appropriate HTTP status codes
4. ✅ Log all errors with full context and stack traces
5. ❌ Don't expose internal error details to clients
6. ❌ Don't ignore exceptions - always log them

### Guards
1. ✅ Chain guards in the right order (Auth → Roles → Resource Owner)
2. ✅ Load necessary relations when fetching user in guards
3. ✅ Use `eager: true` or explicit `relations` for roles
4. ✅ Keep guard logic simple and focused
5. ❌ Don't perform business logic in guards
6. ❌ Don't forget guards run before validation

### Pipes
1. ✅ Use DTOs with class-validator for all inputs
2. ✅ Enable global ValidationPipe with appropriate options
3. ✅ Create custom validators for database checks
4. ✅ Use transform pipes for type conversion
5. ✅ Whitelist properties to prevent mass assignment
6. ❌ Don't perform database operations in transform pipes
7. ❌ Don't validate in controllers - use pipes

---

## 10. Common Mistakes and Solutions

### Mistake 1: Not Loading Relations in Guards
```typescript
// ❌ Wrong - roles not loaded
const user = await this.userRepository.findOne({ where: { id: payload.sub } });
// user.roles is undefined!

// ✅ Correct
const user = await this.userRepository.findOne({
  where: { id: payload.sub },
  relations: ['roles'],
});
```

### Mistake 2: Forgetting to Register Custom Validators
```typescript
// ❌ Wrong - validator not working
export class CreateUserDto {
  @IsUnique('User', 'email') // Won't work!
  email: string;
}

// ✅ Correct - register in module
@Module({
  providers: [IsUniqueConstraint, ExistsConstraint],
  exports: [IsUniqueConstraint, ExistsConstraint],
})
export class CommonModule {}
```

### Mistake 3: Not Handling TypeORM Errors
```typescript
// ❌ Wrong - generic error message
catch (error) {
  throw new BadRequestException('Failed');
}

// ✅ Correct - let exception filter handle it
catch (error) {
  this.logger.error(error.message, 'Service', ip, error.stack);
  throw error; // Filter will handle TypeORM errors properly
}
```

### Mistake 4: Logging Sensitive Data
```typescript
// ❌ Wrong
this.logger.log(`Creating user: ${JSON.stringify(createUserDto)}`, 'UserService', ip);
// Logs the password!

// ✅ Correct
this.logger.log(`Creating user: ${createUserDto.email}`, 'UserService', ip);
```

---

## 11. Hands-On Exercises

### Exercise 1: Add Email Verification Guard
Create a guard that checks if a user's email is verified before allowing access to certain routes.

### Exercise 2: Implement Rate Limiting Pipe
Create a pipe that tracks request counts and throws an exception if limits are exceeded.

### Exercise 3: Custom Validation for Strong Password
Create a custom validator that checks password strength against multiple criteria.

### Exercise 4: Pagination Pipe
Create a reusable pagination pipe that validates and transforms page/limit query parameters.

---
