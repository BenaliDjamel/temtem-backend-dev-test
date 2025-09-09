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
import { S3Service } from '../common/services/s3.service';
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
    private readonly s3Service: S3Service,
  ) {}

  private async assertStoreOwner(
    owner: UserDocument,
    storeId: Types.ObjectId,
  ): Promise<void> {
    const isStoreOwner = await this.storesService.isStoreOwner(owner, storeId);
    if (!isStoreOwner) throw new ForbiddenException();
  }

  async create(
    createProductDto: CreateProductDto,
    createdBy: UserDocument,
    file?: Express.Multer.File,
  ) {
    const store = await this.storesService.findById(createProductDto.store);
    if (!store) throw new NotFoundException('Store not found');

    const slug = slugify(`${store.name}-${createProductDto.name}`);

    let imageUrl = createProductDto.image;
    if (file && file.buffer && file.mimetype.startsWith('image/')) {
      imageUrl = await this.s3Service.uploadPublicFile({
        fileBuffer: file.buffer,
        contentType: file.mimetype,
        keyPrefix: `stores/${store.slug}/products/${slug}`,
      });
    }

    return await this.productModel.create({
      ...createProductDto,
      image: imageUrl || createProductDto.image,
      slug,
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

    await this.assertStoreOwner(owner, store._id);

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
    file?: Express.Multer.File,
  ) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    await this.assertStoreOwner(owner, product.store);

    let imageUrl = updateProductDto.image;

    if (file && file.buffer && file.mimetype.startsWith('image/')) {
      const store = await this.storesService.findById(product.store);
      imageUrl = await this.s3Service.uploadPublicFile({
        fileBuffer: file.buffer,
        contentType: file.mimetype,
        keyPrefix: `stores/${store.slug}/products/${product.slug}`,
      });
    }

    const updateProduct: Partial<Product> = {
      ...updateProductDto,
      ...(imageUrl ? { image: imageUrl } : {}),
    };

    await this.productModel.updateOne({ _id: id }, updateProduct);

    return { message: 'Product updated successfully' };
  }

  async remove(id: Types.ObjectId, owner: UserDocument) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    await this.assertStoreOwner(owner, product.store);

    await this.productModel.deleteOne({ _id: id });

    return { message: 'Product deleted successfully' };
  }
}
