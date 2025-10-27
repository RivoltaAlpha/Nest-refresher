import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from './entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { LoggerService } from '../logger/logger.service';

@ApiBearerAuth('access-token') // This indicates that the endpoints require authentication
@ApiTags('Users') // This groups the endpoints under the 'Users' tag in Swagger documentation
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @Public() // This endpoint is public and does not require authentication
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    this.logger.log(`POST /users - Creating user: ${createUserDto.email}`, 'UsersController', ip);
    return this.usersService.create(createUserDto, ip);
  }

  @Get()
  @Roles(UserRole.Admin) // Only users with the 'Admin' role can access this endpoint
  findAll(@Request() req) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    this.logger.log('GET /users - Fetching all users', 'UsersController', ip);
    return this.usersService.findAll(ip);
  }

  @Get(':id')
  @Roles(UserRole.Admin, UserRole.User, UserRole.Organizer) // Only users with the 'Admin' or 'User' role can access this endpoint
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // find by email 
  @Get('email/:email')
  @Roles(UserRole.Admin, UserRole.Organizer) // Only users with the 'Admin' or 'Organizer' role can access this endpoint
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.Organizer, UserRole.User) // Only users with the 'Admin', 'Organizer', or 'User' role can access this endpoint
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin) 
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
