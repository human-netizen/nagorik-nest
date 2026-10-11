
import { Module } from '@nestjs/common';

import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';

@Module({
  controllers: [TasksController],
  providers: [TasksService, PermissionsGuard],
})
export class TasksModule {}
