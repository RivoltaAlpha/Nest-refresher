import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum paymentStatus {
    Pending = 'Pending',
    Completed = 'Completed',
    Failed = 'Failed',
}

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn()
  registration_id: number;

  @CreateDateColumn({ type: 'datetime2' })
  registration_date: Date;

  @Column({
    type: 'varchar',
    length: 10,
    default: paymentStatus.Pending,
  })
  payment_status: paymentStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  payment_amount: number;

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date;

  // Registration belongs to one user
  @ManyToOne(() => User, (user) => user.registrations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Registration belongs to one event
  @ManyToOne(() => Event, (event) => event.registrations)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  // Registration has one payment
  @OneToOne(() => Payment, (payment) => payment.registration)
  payment: Payment;
}
