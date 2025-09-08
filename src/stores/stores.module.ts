import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from './schemas/store.schema';
import { StoresController } from './stores.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
  ],
  providers: [StoresService],
  exports: [StoresService],
  controllers: [StoresController],
})
export class StoresModule {}
