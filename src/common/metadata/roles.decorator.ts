import { SYSTEM_ROLES } from '../constants/roles.constants';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: SYSTEM_ROLES[]) =>
  SetMetadata(ROLES_KEY, roles);
