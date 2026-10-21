import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  type Relation
} from "typeorm";
import { CURRENT_TIMESTAMP } from '../utils/constans.js';
import { Product } from "../products/product.entity.js";
import { User } from "../users/user.entity.js";

@Entity({ name: 'reviews' })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @Column({ type: 'int' })
  rating: number;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.reviews)
  product: Relation<Product>;

  @ManyToOne(() => User, (user) => user.review)
  user: Relation<User>;
}
