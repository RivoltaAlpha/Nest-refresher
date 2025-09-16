import { Injectable } from '@nestjs/common';
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
  create(createRegistrationDto: CreateRegistrationDto) {
    const registration = this.registrationsRepository.create(createRegistrationDto);
    return this.registrationsRepository.save(registration);
  }

  findAll() {
    return this.registrationsRepository.find();
  }

  findOne(id: number) {
    return this.registrationsRepository.findOneBy({ registration_id: id });
  }

  update(id: number, updateRegistrationDto: UpdateRegistrationDto) {
    return this.registrationsRepository.update(id, updateRegistrationDto);
  }

  remove(id: number) {
    return this.registrationsRepository.delete(id);
  }
}
