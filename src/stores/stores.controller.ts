import { Store } from './schemas/store.schema';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dtos/create-store';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../users/decorators/user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { Roles } from 'src/common/metadata/roles.decorator';
import { SYSTEM_ROLES } from 'src/common/constants/roles.constants';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Roles(SYSTEM_ROLES.STORE_OWNER)
  @ApiBearerAuth('bearer')
  @Post()
  create(
    @Body() createStoreDto: CreateStoreDto,
    @User() user: UserDocument,
  ): Promise<Store> {
    return this.storesService.create(createStoreDto, user);
  }
}
