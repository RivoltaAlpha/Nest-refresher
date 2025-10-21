 import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

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

  // events relationship 
  @OneToMany(() => Event, (event) => event.created_by, 
  { cascade: true, 
    onDelete: 'CASCADE'
  }
)
  events: Event[];
}
