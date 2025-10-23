import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    try {
      const toSave: any = { ...createEventDto };
      if ((createEventDto as any).created_by) {
        toSave.created_by = { user_id: (createEventDto as any).created_by };
      }
      const event = this.eventsRepository.create(toSave);
      return await this.eventsRepository.save(event);
    } catch (error) {
      throw new HttpException('Error creating event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      return await this.eventsRepository.find();
    } catch (error) {
      throw new HttpException('Error fetching events', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const event = await this.eventsRepository.findOneBy({ event_id: id });
      if (!event) throw new NotFoundException('Event not found');
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error fetching event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    try {
      const existing = await this.eventsRepository.findOneBy({ event_id: id });
      if (!existing) throw new NotFoundException('Event not found');
      const toUpdate: any = { ...updateEventDto };
      if ((updateEventDto as any).created_by) {
        toUpdate.created_by = { user_id: (updateEventDto as any).created_by };
      }
      await this.eventsRepository.update(id, toUpdate);
      return await this.eventsRepository.findOneBy({ event_id: id });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error updating event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const result = await this.eventsRepository.delete(id);
      if (result.affected === 0) throw new NotFoundException('Event not found');
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error deleting event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
