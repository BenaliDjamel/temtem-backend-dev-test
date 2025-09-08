import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StoresService } from 'src/stores/stores.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from './schemas/product.schema';

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

  async findAll() {
    return await this.productModel.find();
  }

  async listStoreOwnerProducts(
    slug: string,
    owner: UserDocument,
  ): Promise<ProductDocument[]> {
    const store = await this.storesService.findBySlug(slug);
    if (!store) throw new NotFoundException('Store not found');

    const isStoreOwner = await this.storesService.isStoreOwner(
      owner,
      store._id,
    );
    if (!isStoreOwner) throw new ForbiddenException();

    return await this.productModel.find({ store: store._id });
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
