
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';

import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  @Permissions('TASK_CREATE')
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const userId = request.user.userId;

    return this.tasksService.create(
      userId,
      createTaskDto,
    );
  }

  @Get()
  @Permissions('TASK_READ')
  findAll(
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user.userId;

    return this.tasksService.findAll(userId);
  }

  @Get(':id')
  @Permissions('TASK_READ')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = request.user.userId;

    return this.tasksService.findOne(
      userId,
      id,
    );
  }

  @Patch(':id')
  @Permissions('TASK_UPDATE')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const userId = request.user.userId;

    return this.tasksService.update(
      userId,
      id,
      updateTaskDto,
    );
  }

  @Delete(':id')
  @Permissions('TASK_DELETE')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = request.user.userId;

    return this.tasksService.remove(
      userId,
      id,
    );
  }
}
