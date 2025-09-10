import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

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
  registration_id: number; // Reference to event_registrationstable

  @Column({ type: 'varchar' })
  payment_date: string;

  @Column({ type: 'varchar' })
  amount: string;

  @Column({ type: 'varchar' })
  payment_method: string;

  @Column({
    type: 'enum',
    enum: paymentStatus,
    default: paymentStatus.Pending,
  })
  payment_status: paymentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // relationship with event_registrationstable
}
