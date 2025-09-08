import slugify from 'slugify';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Store } from './schemas/store.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateStoreDto } from './dtos/create-store';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class StoresService {
  constructor(@InjectModel(Store.name) private storeModel: Model<Store>) {}

  async create(storeData: CreateStoreDto, owner: UserDocument): Promise<Store> {
    const slug = slugify(storeData.name);

    const createdStore = new this.storeModel({
      ...storeData,
      slug,
      owner: owner._id,
    });

    await createdStore.save();

    return createdStore;
  }
}
