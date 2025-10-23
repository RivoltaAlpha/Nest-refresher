import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RegistrationsService {
  constructor (
    @InjectRepository(Registration)
    private registrationsRepository: Repository<Registration>,
  ){}
  async create(createRegistrationDto: CreateRegistrationDto) {
    try {
      const toSave: any = { ...createRegistrationDto };
      if ((createRegistrationDto as any).user_id) toSave.user = { user_id: (createRegistrationDto as any).user_id };
      if ((createRegistrationDto as any).event_id) toSave.event = { event_id: (createRegistrationDto as any).event_id };
      const registration = this.registrationsRepository.create(toSave);
      return await this.registrationsRepository.save(registration);
    } catch (error) {
      throw new HttpException('Error creating registration', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      return await this.registrationsRepository.find();
    } catch (error) {
      throw new HttpException('Error fetching registrations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const reg = await this.registrationsRepository.findOneBy({ registration_id: id });
      if (!reg) throw new NotFoundException('Registration not found');
      return reg;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error fetching registration', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateRegistrationDto: UpdateRegistrationDto) {
    try {
      const existing = await this.registrationsRepository.findOneBy({ registration_id: id });
      if (!existing) throw new NotFoundException('Registration not found');
      const toUpdate: any = { ...updateRegistrationDto };
      if ((updateRegistrationDto as any).user_id) toUpdate.user = { user_id: (updateRegistrationDto as any).user_id };
      if ((updateRegistrationDto as any).event_id) toUpdate.event = { event_id: (updateRegistrationDto as any).event_id };
      await this.registrationsRepository.update(id, toUpdate);
      return await this.registrationsRepository.findOneBy({ registration_id: id });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error updating registration', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const result = await this.registrationsRepository.delete(id);
      if (result.affected === 0) throw new NotFoundException('Registration not found');
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error deleting registration', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
