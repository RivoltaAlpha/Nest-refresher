import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
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

  @Column({ type: 'varchar' })
  payment_date: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar' })
  payment_method: string;

  @Column({
    type: 'varchar',
    length: 10,
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
