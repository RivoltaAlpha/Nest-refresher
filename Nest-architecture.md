# Getting Started with NestJS
## Project Structure

NestJS follows a modular architecture, which## Putting It All Together

Let's put everything together to create a simple CRUD (Create, Read, Update### Data Transfer Object: `dto/create-user.dto.ts`

```typescript
export class CreateUserDto {
  id: number;
  name: string;
  age: number;
}
```

### Main Application Module: `app.module.ts`

Finally, don't forget to import the UsersModule in the main application module:

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [UsersModule],
})
export class AppModule {}
```

## Running the Application

To run your NestJS application, use the following command:

```bash
pnpm run start:dev
```

Your application will be running at [http://localhost:3000](http://localhost:3000).n for managing users.

### User Module: `users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```
application is divided into modules. Let's take a look at the default project structure:

```bash
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── common/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── ...
├── modules/
│   ├── users/
│   └── ...
└── ...
```
with NestJS, you'll need Node.js and npm (or yarn) installed on your machine. If you haven't installed these yet, you can download them from the [Node.js website](https://nodejs.org/).

## Installing NestJS CLI

The NestJS Command Line Interface (CLI) is a powerful tool that helps you scaffold and manage your NestJS projects. To install the NestJS CLI globally, run:

```bash
npm install -g @nestjs/cli
```

## Creating a New Project

Once you have the CLI installed, you can create a new NestJS project using the following command:

```bash
nest new project-name
```
To get started with NestJS, you’ll need Node.js and npm (or yarn) installed on your machine. If you haven’t installed these yet, you can download them from the Node.js website.

Installing NestJS CLI
The NestJS Command Line Interface (CLI) is a powerful tool that helps you scaffold and manage your NestJS projects. To install the NestJS CLI globally, run:

```bash
npm install -g @nestjs/cli
```

Creating a New Project
Once you have the CLI installed, you can create a new NestJS project using the following command:

```bash
nest new project-name
```

Replace project-name with your desired project name. The CLI will prompt you to choose a package manager (npm or yarn). After selecting one, it will install the necessary dependencies and create a new project directory.

Project Structure
NestJS follows a modular architecture, which means your application is divided into modules. Let’s take a look at the default project structure:

```bash
src
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── common
│   ├── filters
│   ├── guards
│   ├── interceptors
│   ├── pipes
│   └── ...
├── modules
│   ├── users
│   └── ...
└── ...
```
## Creating Components

### Creating a Module

Modules are the basic building blocks of a NestJS application. To create a new module, use the CLI:

```bash
nest generate module users
```

This command will create a new users module inside the modules directory.

### Creating a Controller

Controllers handle incoming requests and return responses to the client. To create a new controller, use the CLI:

```bash
nest generate controller users
```

This command will create a `users.controller.ts` file inside the users module.

### Creating a Service

Services are used to handle business logic and data access. To create a new service, use the CLI:

```bash
nest generate service users
```
This command will create a users.service.ts file inside the users module.

Putting It All Together
Let’s put everything together to create a simple CRUD (Create, Read, Update, Delete) application for managing users.

### User Module: `users.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

### User Controller: `users.controller.ts`
```typescript
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: CreateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```
### User Service: `users.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private users = [];

  create(createUserDto: CreateUserDto) {
    this.users.push(createUserDto);
    return 'This action adds a new user';
  }

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find(user => user.id === id);
  }

  update(id: number, updateUserDto: CreateUserDto) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex > -1) {
      this.users[userIndex] = updateUserDto;
      return `This action updates a #${id} user`;
    }
  }

  remove(id: number) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex > -1) {
      this.users.splice(userIndex, 1);
      return `This action removes a #${id} user`;
    }
  }
}
```
Data Transfer Object: dto/create-user.dto.ts

```typescript
export class CreateUserDto {
  id: number;
  name: string;
  age: number;
}
```
Main Application Module
Finally, don’t forget to import the UsersModule in the main application module, app.module.ts:

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
@Module({
  imports: [UsersModule],
})
export class AppModule {}
```
Running the Application
To run your NestJS application, use the following command:

```bash
pnpm run start:dev
```
Your application will be running at http://localhost:3000.