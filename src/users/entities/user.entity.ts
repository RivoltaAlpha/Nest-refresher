 import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Event } from 'src/events/entities/event.entity';
import { Registration } from 'src/registrations/entities/registration.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';

// ENUM('Admin', 'Manager', 'Warehouse', 'Sales', 'Supplier'
export enum UserRole {
  Admin = 'Admin',
  Organizer = 'Organizer',
  User = 'User',
  Guest = 'Guest',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hashedRefreshToken?: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    default: UserRole.User,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date;

  // User creates many events
  @OneToMany(() => Event, (event) => event.created_by, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  events: Event[];

  // User has many registrations
  @OneToMany(() => Registration, (registration) => registration.user, {
    cascade: true
  })
  registrations: Registration[];

  // User provides many feedback
  @OneToMany(() => Feedback, (feedback) => feedback.user, {
    cascade: true
  })
  feedback: Feedback[];
}
