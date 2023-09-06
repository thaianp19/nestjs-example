import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
