import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum paymentStatus {
    Pending = 'Pending',
    Completed = 'Completed',
    Failed = 'Failed',
}

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn()
  registration_id: number;

  @Column()
  event_id: number; // Reference to events table

  @Column()
  user_id: number; // Reference to users table

  @CreateDateColumn()
  registration_date: Date;

  @Column({
    type: 'enum',
    enum: paymentStatus,
  })
  payment_status: paymentStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  payment_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
