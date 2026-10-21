import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  type Relation
} from "typeorm";
import { CURRENT_TIMESTAMP } from '../utils/constans.js';
import { Review } from "../reviews/revew.entity.js";
import { User } from "../users/user.entity.js";

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '150' })
  title: string;

  @Column()
  description: string;

  @Column({ type: 'float' })
  price: number;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
  updatedAt: Date;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Relation<Review[]>;

  @ManyToOne(() => User, (user) => user.product)
  user: Relation<User>;
}
