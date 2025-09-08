import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { StoresService } from 'src/stores/stores.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private storesService: StoresService,
  ) {}

  async create(createProductDto: CreateProductDto, createdBy: UserDocument) {
    const store = await this.storesService.findById(createProductDto.store);
    if (!store) throw new NotFoundException('Store not found');

    return await this.productModel.create({
      ...createProductDto,
      slug: slugify(`${store.name}-${createProductDto.name}`),
      createdBy: createdBy._id,
    });
  }

  findAll() {
    return `This action returns all products`;
  }

  async findOne(slug: string) {
    const product = await this.productModel.findOne({ slug });
    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async update(
    id: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    owner: UserDocument,
  ) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    const isStoreOwner = await this.storesService.isStoreOwner(
      owner,
      product.store,
    );

    if (!isStoreOwner) throw new ForbiddenException();

    await this.productModel.updateOne({ _id: id }, updateProductDto);

    return { message: 'Product updated successfully' };
  }

  async remove(id: Types.ObjectId, owner: UserDocument) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    const isStoreOwner = await this.storesService.isStoreOwner(
      owner,
      product.store,
    );

    if (!isStoreOwner) throw new ForbiddenException();

    await this.productModel.deleteOne({ _id: id });

    return { message: 'Product deleted successfully' };
  }
}
