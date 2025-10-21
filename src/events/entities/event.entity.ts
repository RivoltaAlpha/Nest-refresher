import { User } from '../../users/entities/user.entity';
import { Registration } from '../../registrations/entities/registration.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  event_id: number;

  @Column({ type: 'varchar', length: 50 })
  event_name: string;

  @Column({ type: 'varchar', length: 250 })
  event_date: string;

  @Column({ type: 'varchar', length: 250 })
  event_location: string;

  @Column({ type: 'varchar', length: 250 })
  event_description: string;

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  // Event has many registrations
  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];

  // Event receives many feedback
  @OneToMany(() => Feedback, (feedback) => feedback.event)
  feedback: Feedback[];
}
