import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-products.dto.js';
import { UpdateProductDto } from './dtos/update-products.dto.js';
import { UsersService } from '../users/users.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>
  ) { }



  /**
   * Create Product
   */
  async CreateProduct(dto: CreateProductDto) {
    const newProduct = this.productsRepository.create(dto);
    return await this.productsRepository.save(newProduct);
  }

  /**
  * get All Products
  */
  getAll() {
    return this.productsRepository.find();
  }

  /**
 * Get One By Id
 */
  async getOneBy(id: number) {
    const product =await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /**
 * Update Product
 */
  async Update(id: number, dto: UpdateProductDto,) {
    const product = await this.getOneBy(id);


    product.title = dto.title ?? product.title;
    product.description = dto.description ?? product.description;
    product.price = dto.price ?? product.price;

    return this.productsRepository.save(product);
  }

  /**
  * Delete Product
  */
  async Delete(id: number) {
    const product = await this.getOneBy(id);
    await this.productsRepository.remove(product);
    return { message: 'product deleted' };
  }


}