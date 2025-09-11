import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from './entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiBearerAuth('access-token') // This indicates that the endpoints require authentication
@ApiTags('Users') // This groups the endpoints under the 'Users' tag in Swagger documentation
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public() // This endpoint is public and does not require authentication
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.Admin) // Only users with the 'Admin' role can access this endpoint
  findAll() {
    return this.usersService.findAll();
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
