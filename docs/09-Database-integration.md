# 🗃️ Database Configuration

## Setting up TypeORM

Create a database configuration file:

**src/config/database.config.ts**
```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'event_management',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};
```

## Update **app.module.ts**:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
  ],
})
export class AppModule {}
```

Alternatively, create database.module.ts:
``` typescript
import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from "@nestjs/config";

// helps load env variables
config({
    path: ['.env', 'env.prod', 'env.local']
})

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.getOrThrow<string>('DB_HOST'),
                port: configService.getOrThrow<number>('DB_PORT'),
                username: configService.getOrThrow<string>('DB_USERNAME'),
                password: configService.getOrThrow<string>('DB_PASSWORD'),
                database: configService.getOrThrow<string>('DB_NAME'),
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: configService.getOrThrow<boolean>('DB_SYNC', true),
                logging: configService.getOrThrow<boolean>('DB_LOGGING', false),   
                migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
         }),
         inject: [ConfigService] // Inject ConfigService to access configuration values
        })
    ],
})
export class DatabaseModule {}
```

In app.module.ts:
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [UsersModule, AuthModule, EventsModule, RegistrationsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```