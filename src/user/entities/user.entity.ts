import { Product } from 'src/products/entities/product.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;


  @OneToMany(() => Product, (product) => product.user, {
    cascade: true,
  })
  products: Product[];
}
