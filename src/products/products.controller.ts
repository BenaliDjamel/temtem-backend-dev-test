import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { QueryFilterDto } from './dto/query-filter.dto';
import { User } from '../users/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/metadata/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { Public } from '../common/metadata/public.decorator';
import { SYSTEM_ROLES } from '../common/constants/roles.constants';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBearerAuth('bearer')
  @Roles(SYSTEM_ROLES.STORE_OWNER)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        store: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['name', 'price', 'category', 'store'],
    },
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @User() user: UserDocument,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), //2MB
          new FileTypeValidator({
            fileType: /^(image\/(png|jpeg|jpg|webp|gif))$/i,
          }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, user, file);
  }

  @Get()
  @Public()
  findAll(@Query() queryFilter: QueryFilterDto) {
    return this.productsService.findAll(queryFilter);
  }

  @Get('store/:slug')
  @ApiBearerAuth('bearer')
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
  @ApiBearerAuth('bearer')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: UserDocument,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @Roles(SYSTEM_ROLES.STORE_OWNER)
  remove(@Param('id') id: Types.ObjectId, @User() user: UserDocument) {
    return this.productsService.remove(id, user);
  }
}
