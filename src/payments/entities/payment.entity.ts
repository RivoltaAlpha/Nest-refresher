import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';

export enum paymentStatus {
  Success = 'Success',
  Failed = 'Failed',
  Pending = 'Pending',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column({ type: 'datetime2' })
  payment_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'nvarchar', length: 50 })
  payment_method: string;

  @Column({
    type: 'nvarchar',
    length: 20,
    default: paymentStatus.Pending,
  })
  payment_status: paymentStatus;

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date;

  // Payment belongs to one registration
  @OneToOne(() => Registration, (registration) => registration.payment)
  @JoinColumn({ name: 'registration_id' })
  registration: Registration;
}
