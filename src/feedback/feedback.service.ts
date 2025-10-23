import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto) {
    try {
      const toSave: any = { ...createFeedbackDto };
      if ((createFeedbackDto as any).user_id) toSave.user = { user_id: (createFeedbackDto as any).user_id };
      if ((createFeedbackDto as any).event_id) toSave.event = { event_id: (createFeedbackDto as any).event_id };
      const feedback = this.feedbackRepository.create(toSave);
      return await this.feedbackRepository.save(feedback);
    } catch (error) {
      throw new HttpException('Error creating feedback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      return await this.feedbackRepository.find();
    } catch (error) {
      throw new HttpException('Error fetching feedback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const f = await this.feedbackRepository.findOneBy({ feedback_id: id });
      if (!f) throw new NotFoundException('Feedback not found');
      return f;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error fetching feedback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    try {
      const existing = await this.feedbackRepository.findOneBy({ feedback_id: id });
      if (!existing) throw new NotFoundException('Feedback not found');
      const toUpdate: any = { ...updateFeedbackDto };
      if ((updateFeedbackDto as any).user_id) toUpdate.user = { user_id: (updateFeedbackDto as any).user_id };
      if ((updateFeedbackDto as any).event_id) toUpdate.event = { event_id: (updateFeedbackDto as any).event_id };
      await this.feedbackRepository.update(id, toUpdate);
      return await this.feedbackRepository.findOneBy({ feedback_id: id });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error updating feedback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const result = await this.feedbackRepository.delete(id);
      if (result.affected === 0) throw new NotFoundException('Feedback not found');
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error deleting feedback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
