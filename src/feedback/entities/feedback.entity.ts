import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('feedbacks')
export class Feedback {
    @PrimaryGeneratedColumn()
    feedback_id: number;

    @Column()
    event_id: number;
    
    @Column()
    user_id: number;	// Reference to userstable

    @Column({type: 'decimal', precision: 2})
    rating: number;

    @Column({type: 'varchar', length:255})
    comments: string;
    
    @Column()
    created_at: Date
}
