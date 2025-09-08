import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilterDto } from './dto/query-filter.dto';
import { StoresService } from '../stores/stores.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Order } from '../common/constants/order.constants';
import { UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from './schemas/product.schema';
import { PaginationResultDto } from '../common/dtos/pagination-result.dto';

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

  async findAll(
    queryFilter: QueryFilterDto,
  ): Promise<PaginationResultDto<Product>> {
    const {
      category,
      order = Order.ASC,
      orderBy = 'createdAt',
      page = 1,
      limit = 10,
    } = queryFilter;

    const query: Record<string, any> = {};
    if (category) query.category = category;

    const sort: Record<string, 1 | -1> = {
      [orderBy]: order === Order.DESC ? -1 : 1,
    };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.productModel.find(query).sort(sort).skip(skip).limit(limit),
      this.productModel.countDocuments(query),
    ]);

    return new PaginationResultDto<Product>({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
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
