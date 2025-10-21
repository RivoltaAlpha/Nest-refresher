import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { User } from "src/users/entities/user.entity"
import { Event } from "src/events/entities/event.entity"

@Entity('feedbacks')
export class Feedback {
    @PrimaryGeneratedColumn()
    feedback_id: number;
    
    @Column({type: 'decimal', precision: 2})
    rating: number;

    @Column({type: 'varchar', length:255})
    comments: string;
    
    @CreateDateColumn({ type: 'datetime2' })
    created_at: Date;

    // Many feedback belong to one user
    @ManyToOne(() => User, (user) => user.feedback)
    @JoinColumn({ name: 'user_id' })
    user: User;

    // Many feedback belong to one event
    @ManyToOne(() => Event, (event) => event.feedback)
    @JoinColumn({ name: 'event_id' })
    event: Event;
}
