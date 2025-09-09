import slugify from 'slugify';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Store, StoreDocument } from './schemas/store.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateStoreDto } from './dtos/create-store';
import { UserDocument } from '../users/schemas/user.schema';

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

  async findById(id: Types.ObjectId): Promise<StoreDocument> {
    return await this.storeModel.findById(id);
  }

  async findBySlug(slug: string): Promise<StoreDocument> {
    return await this.storeModel.findOne({ slug });
  }

  async isStoreOwner(
    user: UserDocument,
    storeId: Types.ObjectId,
  ): Promise<boolean> {
    const store = await this.findById(storeId);
    if (!store) return false;

    if (!store.owner.equals(user._id)) return false;

    return true;
  }
}
