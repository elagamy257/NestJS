import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-products.dto.js';
import { UpdateProductDto } from './dtos/update-products.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity.js';
import { Between, Like, Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly usersService: UsersService
  ) { }



  /**
   * Create Product
   * @param dto data for creating new product
   * @param userId id of the logged uder (admin)
   * @returns  the created product from the db
   */
  async CreateProduct(dto: CreateProductDto, userId: number) {
    const user = await this.usersService.getCurrentUser(userId)
    const newProduct = this.productsRepository.create({
      ...dto,
      title: dto.title.toLowerCase(),
      user
    });
    return await this.productsRepository.save(newProduct);
  }

  /**
  * get All Products
  * @returns collections of products
  */
  getAll(title?: string, minPrice?: string, maxPrice?: string,) {
    const filters = {
      ...(title ? { title: Like(`%${title?.toLowerCase}%`) } : {}),
      ...(minPrice && maxPrice ? { price: Between(parseInt(minPrice), parseInt(maxPrice)) } : {}),
    }
    return this.productsRepository.find({ where: filters });
  }

  /**
 * Get One By Id
 * @param id for the product
 * @returns product from the db
 */
  async getOneBy(id: number) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /**
 * Update Product
 * @param id for the product
 * @param dto data for the updating product
 * @returns updated product 
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
  * @param id for the product
  * @returns successs message 
  */
  async Delete(id: number) {
    const product = await this.getOneBy(id);
    await this.productsRepository.remove(product);
    return { message: 'product deleted' };
  }


}