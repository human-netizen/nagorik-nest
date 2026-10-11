import { Module } from '@nestjs/common';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PermissionsGuard],
})
export class UsersModule {}