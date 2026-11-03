import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from '../utils/constans';
import { Product } from '../products/product.entity';
import { Review } from '../reviews/review.entity';
import { UserType } from '../utils/enums';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '150', nullable: true })
  username: string;

  @Column({ type: 'varchar', length: '250', unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.NORMaL_USER })
  userType: UserType;

  @Column({ default: false })
  isAccountVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  verificationToken: string | null;

  @Column({ nullable: true, default: null })
  profileImage: string;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.user)
  product: Relation<Product[]>;

  @OneToMany(() => Review, (review) => review.user)
  review: Relation<Review[]>;
}
