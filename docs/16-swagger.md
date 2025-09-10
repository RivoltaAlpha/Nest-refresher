# School Management System - JWT Authentication with Role-Based Access Control (RBAC)

Please check the: [API Design](./API%20Design.md)

## OpenAPI Documentation Implementation Guide

This guide provides step-by-step instructions for implementing comprehensive OpenAPI (Swagger) documentation in a NestJS application with JWT authentication and role-based access control.

## Installation and Setup

### Step 1: Install Required Dependencies

Install the necessary Swagger packages for NestJS:

```bash
npm install @nestjs/swagger
```

### Step 2: Import Swagger Module

In your `main.ts` file, import the required Swagger modules:

**File:** `src/main.ts`

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
```

### Step 3: Basic Swagger Setup

Add basic Swagger configuration to your `main.ts` file:

**File:** `src/main.ts`

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Your existing middleware and configuration...
  
  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('University API')
    .setDescription('API documentation for the University application')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: '/docs-json',
  });

  await app.listen(PORT);
}
```

## Basic Swagger Configuration

### Step 4: Configure DocumentBuilder

The `DocumentBuilder` provides a fluent API to configure your Swagger documentation:

```typescript
const config = new DocumentBuilder()
  .setTitle('University API')                    // API title
  .setDescription('API documentation for the University application')  // API description
  .setVersion('1.0')                            // API version
  .addTag('auth', 'Authentication endpoints')   // Add tags for grouping
  .addTag('students', 'Student management')
  .addTag('courses', 'Course management')
  .addTag('profiles', 'Profile management')
  .addTag('departments', 'Department management')
  .addTag('lecturer', 'Lecturer management')
  .build();
```

### Step 5: Setup Swagger UI

Configure the Swagger UI with custom options:

```typescript
SwaggerModule.setup('docs', app, documentFactory, {
  jsonDocumentUrl: '/docs-json',               // JSON endpoint
  yamlDocumentUrl: '/docs-yaml',               // YAML endpoint (optional)
  swaggerOptions: {
    persistAuthorization: true,                 // Remember auth token
    tagsSorter: 'alpha',                       // Sort tags alphabetically
    operationsSorter: 'alpha',                 // Sort operations alphabetically
  },
});
```

## Adding Authentication to Swagger

### Step 6: Add Bearer Authentication

Configure JWT Bearer token authentication in Swagger:

**File:** `src/main.ts`

```typescript
const config = new DocumentBuilder()
  .setTitle('University API')
  .setDescription('API documentation for the University application')
  .setVersion('1.0')
  .addBearerAuth()                             // Add Bearer token authentication
  .build();
```

### Step 7: Document Controllers with Authentication

Add authentication decorators to your controllers:

**File:** `src/students/students.controller.ts`

```typescript
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('students')                           // Group endpoints under 'students' tag
@ApiBearerAuth()                              // Require Bearer token for all endpoints
@Controller('students')
@UseGuards(AtGuard, RolesGuard)
export class StudentsController {
  // Your controller methods...
}
```

### Step 8: Apply to All Protected Controllers

Apply the same pattern to all controllers that require authentication:

```typescript
// profiles.controller.ts
@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')

// courses.controller.ts  
@ApiTags('courses')
@ApiBearerAuth()
@Controller('courses')

// departments.controller.ts
@ApiTags('departments')
@ApiBearerAuth() 
@Controller('departments')

// lecturer.controller.ts
@ApiTags('lecturer')
@ApiBearerAuth()
@Controller('lecturer')

// auth.controller.ts (no @ApiBearerAuth since it handles login)
@ApiTags('auth')
@Controller('auth')
```

## DTO Documentation with ApiProperty

### Step 9: Document DTO Properties

Add `@ApiProperty` decorators to all your DTOs for comprehensive documentation:

**File:** `src/auth/dto/login.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ 
    description: 'The email of the user', 
    example: 'example@mail.com', 
    required: true 
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'The password of the user', 
    example: 'strongpassword123', 
    required: true 
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
```

**File:** `src/students/dto/create-student.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({
    description: 'The enrollment date of the student',
    example: '2023-09-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  enrollmentDate: string;

  @ApiProperty({
    description: 'The degree program of the student',
    example: 'Computer Science',
    required: false,
  })
  @IsString()
  @IsOptional()
  degreeProgram?: string;

  @ApiProperty({
    description: 'The GPA of the student (0.0 to 4.0)',
    example: 3.75,
    minimum: 0,
    maximum: 4.0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(4.0)
  @IsOptional()
  gpa?: number;
}
```

### Step 10: Document Enum Properties

For DTOs with enum properties, provide comprehensive enum documentation:

**File:** `src/profiles/dto/create-profile.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/profile.entity';

export class CreateProfileDto {
  @ApiProperty({
    description: 'The role of the user in the system',
    enum: Role,
    example: Role.STUDENT,
    default: Role.GUEST,
    enumName: 'Role',
  })
  @IsEnum(Role)
  role: Role = Role.GUEST;
}
```

### Step 11: Update PartialType Imports

For update DTOs, use Swagger's PartialType instead of mapped-types:

**File:** `src/students/dto/update-student.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';  // Changed from @nestjs/mapped-types
import { CreateStudentDto } from './create-student.dto';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
```

## Controller Documentation

### Step 12: Document Controller Methods

Add detailed documentation to controller methods:

```typescript
import { 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';

@Controller('students')
@ApiTags('students')
@ApiBearerAuth()
export class StudentsController {
  
  @Post()
  @ApiOperation({ 
    summary: 'Create a new student',
    description: 'Creates a new student record with the provided information. Requires ADMIN or FACULTY role.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Student successfully created',
    type: Student  // Define your response type
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions. Requires ADMIN or FACULTY role.' })
  @Roles(Role.ADMIN, Role.FACULTY)
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get student by ID',
    description: 'Retrieves a specific student by their ID. Accessible to ADMIN, FACULTY, and STUDENT roles.'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'Student ID',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Student found',
    type: Student
  })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all students',
    description: 'Retrieves a list of all students. Supports filtering by name. Requires ADMIN or FACULTY role.'
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter students by name',
    example: 'John'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of students',
    type: [Student]  // Array of students
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions. Requires ADMIN or FACULTY role.' })
  @Roles(Role.ADMIN, Role.FACULTY)
  findAll(@Query('name') name?: string) {
    return this.studentsService.findAll(name);
  }
}
```

### Step 13: Document Public Endpoints

For public endpoints (like authentication), omit the `@ApiBearerAuth()` but still add comprehensive documentation:

```typescript
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  
  @Post('signin')
  @Public()
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticates a user and returns access and refresh tokens'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @ApiUnauthorizedResponse({ description: 'Authentication failed' })
  signin(@Body() dto: CreateAuthDto) {
    return this.authService.signin(dto);
  }
}
```

## Advanced Swagger Features

### Step 14: Add Global Response Schemas

Define common response schemas for reuse:

**File:** `src/main.ts`

```typescript
const config = new DocumentBuilder()
  .setTitle('University API')
  .setDescription('API documentation for the University application')
  .setVersion('1.0')
  .addBearerAuth()
  .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')  // Optional API key
  .addServer('http://localhost:8000', 'Development server')
  .addServer('https://api.university.com', 'Production server')
  .build();
```

### Step 15: Configure Swagger UI Options

Enhance the Swagger UI with additional options:

```typescript
SwaggerModule.setup('docs', app, documentFactory, {
  jsonDocumentUrl: '/docs-json',
  yamlDocumentUrl: '/docs-yaml',
  swaggerOptions: {
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
    docExpansion: 'none',                      // Collapse all sections by default
    filter: true,                              // Enable search filter
    showRequestDuration: true,                 // Show request duration
    tryItOutEnabled: true,                     // Enable "Try it out" button
  },
  customCss: `
    .swagger-ui .topbar { display: none; }    /* Hide Swagger logo */
    .swagger-ui .info { margin-bottom: 20px; }
  `,
  customSiteTitle: 'University API Documentation',
});
```

### Step 16: Add Custom Metadata

Add additional metadata to your API documentation:

```typescript
const config = new DocumentBuilder()
  .setTitle('University API')
  .setDescription(`
    # University Management System API
  
    This API provides comprehensive endpoints for managing:
    - Student records and enrollment
    - Course management and assignments
    - Faculty and lecturer profiles
    - Department administration
    - User authentication and authorization
  
    ## Authentication
  
    This API uses JWT Bearer tokens for authentication. To access protected endpoints:
  
    1. Login using the \`/auth/signin\` endpoint
    2. Use the returned \`accessToken\` in the Authorization header
    3. Format: \`Authorization: Bearer <your-token>\`
  
    ## Roles and Permissions
  
    - **ADMIN**: Full access to all resources
    - **FACULTY**: Can manage students, courses, and view most data
    - **STUDENT**: Limited access to own data and course information
    - **GUEST**: Public access only
  `)
  .setVersion('1.0')
  .setTermsOfService('https://university.com/terms')
  .setContact('API Support', 'https://university.com/support', 'api-support@university.com')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addBearerAuth()
  .build();
```

## Testing Your API Documentation

### Step 17: Access Your Documentation

1. **Start your application**:

   ```bash
   npm run start:dev
   ```
2. **Navigate to Swagger UI**:

   ```
   http://localhost:8000/docs
   ```
3. **Access JSON documentation**:

   ```
   http://localhost:8000/docs-json
   ```

### Step 18: Test Authentication Flow

1. **Test login endpoint**:

   - Go to the `auth` section in Swagger UI
   - Try the `POST /auth/signin` endpoint
   - Use credentials from your seeded data
2. **Authorize Swagger UI**:

   - Click the "Authorize" button in the top-right
   - Enter your access token: `Bearer <your-token>`
   - Click "Authorize"
3. **Test protected endpoints**:

   - Try accessing any protected endpoint
   - Verify that the Authorization header is automatically included

### Step 19: Verify Role-Based Access

Test different user roles:

```javascript
// Test with different role tokens
const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const facultyToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const studentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Try accessing admin-only endpoints with different tokens
// Expected results:
// Admin token: 200 OK
// Faculty token: 403 Forbidden  
// Student token: 403 Forbidden
```

### Step 20: Validate Documentation Completeness

Ensure your documentation includes:

- ✅ All endpoints are documented with `@ApiOperation`
- ✅ All DTOs have `@ApiProperty` decorators
- ✅ Authentication requirements are clear
- ✅ Role-based access is documented
- ✅ Error responses are documented
- ✅ Examples are provided for all inputs
- ✅ Response schemas are defined

## Best Practices for OpenAPI Documentation

### Documentation Standards

1. **Consistent Descriptions**: Use clear, concise descriptions for all endpoints
2. **Comprehensive Examples**: Provide realistic examples for all inputs and outputs
3. **Error Documentation**: Document all possible error responses
4. **Role Requirements**: Clearly specify which roles can access each endpoint
5. **Parameter Validation**: Document all validation rules and constraints

### Code Organization

1. **Import Organization**: Group Swagger imports together
2. **Decorator Placement**: Place API decorators before route decorators
3. **DTO Documentation**: Document all properties in DTOs, even optional ones
4. **Consistent Naming**: Use consistent naming for tags and operations

### Security Documentation

1. **Authentication Methods**: Clearly document how to authenticate
2. **Permission Levels**: Specify required roles for each endpoint
3. **Token Management**: Document token lifecycle and refresh process
4. **Error Handling**: Document authentication and authorization errors

This comprehensive OpenAPI implementation provides:

- **Complete API Documentation**: Every endpoint is thoroughly documented
- **Interactive Testing**: Swagger UI allows real-time API testing
- **Authentication Integration**: JWT tokens work seamlessly with Swagger UI
- **Role-Based Documentation**: Clear indication of access requirements
- **Developer Experience**: Easy-to-use interface for API exploration
- **Production Ready**: Comprehensive error handling and response documentation

Your API documentation will be accessible at `http://localhost:8000/docs` and provides a complete interface for testing and exploring your University Management System API.