import { Controller, Get, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
     constructor(private readonly seedService: SeedService) { }

  @Get('all')
  async seedAll() {
    await this.seedService.seedDatabase();
    return { message: 'All data seeded successfully' };
  }

  @Get('users')
  async seedUsers() {
    await this.seedService.seedUsers();
    return { message: 'Users seeded successfully' };
  }

    @Post('clear')
  async clearDatabase() {
    await this.seedService.clearDatabase();
    return { message: 'Database cleared successfully' };
  }
}
