import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PaymentsModule } from './payments/payments.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guards';
import { AtGuard } from './auth/guards/access-token.guards';
import { User } from './users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database/database.config';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    LoggerModule, // Add LoggerModule first to make it available globally
    UsersModule, 
    AuthModule, 
    EventsModule, 
    RegistrationsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    DatabaseModule,
    FeedbackModule,
    PaymentsModule,
    TypeOrmModule.forFeature([User]),
    SeedModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
      {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})

export class AppModule {}
