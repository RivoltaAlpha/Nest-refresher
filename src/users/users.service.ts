import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}


  async create(createUserDto: CreateUserDto, ip?: string): Promise<User> {
    this.logger.log(`Creating new user: ${createUserDto.email}`, 'UsersService', ip);
    
    try {
      // prevent duplicate email
      const existing = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
      if (existing) {
        this.logger.warn(`Attempt to create user with existing email: ${createUserDto.email}`, 'UsersService', ip);
        throw new ConflictException('Email already in use');
      }

      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);
      
      this.logger.database('INSERT', 'User', 'UsersService', ip);
      this.logger.log(`User created successfully: ${savedUser.user_id}`, 'UsersService', ip);
      
      return savedUser;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(`Failed to create user: ${error.message}`, 'UsersService', ip, error.stack);
      throw new HttpException('Unable to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(ip?: string) {
    this.logger.database('SELECT', 'User (all)', 'UsersService', ip);
    
    try {
      const users = await this.usersRepository.find({
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
        },
      });
      
      this.logger.log(`Retrieved ${users.length} users`, 'UsersService', ip);
      return users;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, 'UsersService', ip, error.stack);
      throw new HttpException('Error fetching users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(user_id: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { user_id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${user_id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Error while finding user');
    }
  }

    async findByEmail(email: string): Promise<User | null> {
      try {
        return await this.usersRepository.findOne({ where: { email } });
      } catch (error) {
        throw new HttpException('Error fetching user by email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

async update(user_id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      // check if user exists
      const existingUser = await this.usersRepository.findOne({ 
        where: { user_id } 
      });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${user_id} not found`);
      }
      // Update and return the updated user
      await this.usersRepository.update(user_id, updateUserDto);
      const updatedUser = await this.usersRepository.findOne({ where: { user_id } });
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${user_id} not found after update`);
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error while updating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

  async remove(id: string): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error deleting user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
