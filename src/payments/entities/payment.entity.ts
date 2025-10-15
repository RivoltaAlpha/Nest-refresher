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

  // relationship with event_registrationstable
}
