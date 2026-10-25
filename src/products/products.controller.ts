import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Put,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-products.dto.js';
import { UpdateProductDto } from './dtos/update-products.dto.js';
import { ProductsService } from './products.service.js';
import { AuthRolesGuard } from '../users/guards/auth.roles.guard.js';
import { Roles } from '../users/decorators/user-role-decorator.js';
import { UserType } from '../utils/enums.js';
import { CurrentUser } from '../users/decorators/current-user-decorator.js';
import * as type from '../utils/type.js';

@Controller('api/products')
export class ProductsControllers {
  constructor(
    private readonly productsService: ProductsService,
  ) { }

  // POST:  ~/api/products
  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  CreateNewProduct(@Body() body: CreateProductDto, @CurrentUser() payload: type.JWTPayloadType) {
    return this.productsService.CreateProduct(body, payload.id);
  }

  // GET:  ~/api/products
  @Get()
  getAllProducts(
    @Query('title') title:string,
    @Query('minPrice') minPrice:string,
    @Query('maxPrice') maxPrice:string
   ) {
    return this.productsService.getAll(title,minPrice,maxPrice);
  }

  // GET:  ~/api/products/:id
  @Get(':id')
  getSingleProducts(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOneBy(id);
  }
  // PUT:  ~/api/products/:id
  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  UpdateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProductDto,) {
    return this.productsService.Update(id, body);
  }

  // Delete:  ~/api/products/:id
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  DeleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.Delete(id);
  }
}
