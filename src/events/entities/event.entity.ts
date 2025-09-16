import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'varchar', length: 250 })
  created_by: number; // Reference to userstable (organizer)

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
