import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
}
