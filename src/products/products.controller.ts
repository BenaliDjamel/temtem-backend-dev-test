import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductsService } from './products.service';
import { User } from '../users/decorators/user.decorator';
import { Roles } from '../common/metadata/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { Public } from 'src/common/metadata/public.decorator';
import { SYSTEM_ROLES } from '../common/constants/roles.constants';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(SYSTEM_ROLES.STORE_OWNER)
  create(
    @Body() createProductDto: CreateProductDto,
    @User() user: UserDocument,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @Public()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('store/:slug')
  @Roles(SYSTEM_ROLES.STORE_OWNER)
  listStoreOwnerProducts(
    @Param('slug') slug: string,
    @User() user: UserDocument,
  ) {
    return this.productsService.listStoreOwnerProducts(slug, user);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @Patch(':id')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: UserDocument,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Roles(SYSTEM_ROLES.STORE_OWNER)
  remove(@Param('id') id: Types.ObjectId, @User() user: UserDocument) {
    return this.productsService.remove(id, user);
  }
}
