import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    try {
      const toSave: any = { ...createPaymentDto };
      if ((createPaymentDto as any).registration_id) toSave.registration = { registration_id: (createPaymentDto as any).registration_id };
      const payment = this.paymentsRepository.create(toSave);
      return await this.paymentsRepository.save(payment);
    } catch (error) {
      throw new HttpException('Error creating payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      return await this.paymentsRepository.find();
    } catch (error) {
      throw new HttpException('Error fetching payments', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const p = await this.paymentsRepository.findOneBy({ payment_id: id });
      if (!p) throw new NotFoundException('Payment not found');
      return p;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error fetching payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    try {
      const existing = await this.paymentsRepository.findOneBy({ payment_id: id });
      if (!existing) throw new NotFoundException('Payment not found');
      const toUpdate: any = { ...updatePaymentDto };
      if ((updatePaymentDto as any).registration_id) toUpdate.registration = { registration_id: (updatePaymentDto as any).registration_id };
      await this.paymentsRepository.update(id, toUpdate);
      return await this.paymentsRepository.findOneBy({ payment_id: id });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error updating payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const result = await this.paymentsRepository.delete(id);
      if (result.affected === 0) throw new NotFoundException('Payment not found');
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error deleting payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
