import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { log } from 'console';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(product: CreateProductDto, request) {
    const newProduct: Product = await this.productsRepository.create({
      user_id: request.userId,
      id: product.id,
      title: product.title,
    });
    return await this.productsRepository.save(newProduct);
  }

  async findAll() {
    return await this.productsRepository.find({ relations: ['user'] });
  }

  async update(
    productId: number,
    updateProductDto: UpdateProductDto,
    request: Request,
  ) {
    const product = await this.findOne(productId);

    if (!product) {
      throw new NotFoundException('not found');
    }

    product.user_id = request.userId;
    product.title = updateProductDto.title;
    return await this.productsRepository.save(product);
  }

  async findOne(id: number) {
    return await this.productsRepository.findOne({
      where: {
        id: id,
      },
      relations: ['user'],
    });
  }
}
