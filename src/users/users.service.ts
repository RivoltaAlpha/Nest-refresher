import { Injectable, NotFoundException, Response } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}


  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto)
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find({
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
            }
    })
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
    return this.usersRepository.findOne({ where: { email } });
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
      // Update the user
      await this.usersRepository.update(user_id, updateUserDto);
      
      // Return the updated user
      const updatedUser = await this.usersRepository.findOne({ where: { user_id } });
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${user_id} not found after update`);
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Error while updating user');
    }
}

async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

}
