import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';

@Module({
  imports: [UsersModule, AuthModule, EventsModule, RegistrationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
