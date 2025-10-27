import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Global() // Make the logger available globally
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}