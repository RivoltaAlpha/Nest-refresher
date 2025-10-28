// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Registration } from '../registrations/entities/registration.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Event,
      Feedback,
      Payment,
      Registration,
    ]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule { }