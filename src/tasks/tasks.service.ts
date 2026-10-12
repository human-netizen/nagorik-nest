
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async hasPermission(
    userId: number,
    permissionName: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.role.permissions.some(
      (rolePermission) =>
        rolePermission.permission.name === permissionName,
    );
  }

  async create(
    userId: number,
    createTaskDto: CreateTaskDto,
  ) {
    let taskOwnerId = userId;

    if (createTaskDto.userId !== undefined) {
      const canAssignTasks = await this.hasPermission(
        userId,
        'TASK_ASSIGN',
      );

      if (!canAssignTasks) {
        throw new ForbiddenException(
          'You do not have permission to assign tasks',
        );
      }

      const targetUser = await this.prisma.user.findUnique({
        where: {
          id: createTaskDto.userId,
        },
      });

      if (!targetUser) {
        throw new NotFoundException(
          'Target user not found',
        );
      }

      taskOwnerId = targetUser.id;
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        userId: taskOwnerId,
      },
    });
  }

  async findAll(userId: number) {
    const canManageAllTasks = await this.hasPermission(
      userId,
      'TASK_MANAGE_ALL',
    );

    return this.prisma.task.findMany({
      where: canManageAllTasks
        ? {}
        : { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    userId: number,
    taskId: number,
  ) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      const canManageAllTasks =
        await this.hasPermission(
          userId,
          'TASK_MANAGE_ALL',
        );

      if (!canManageAllTasks) {
        throw new NotFoundException('Task not found');
      }
    }

    return task;
  }

  async update(
    userId: number,
    taskId: number,
    updateTaskDto: UpdateTaskDto,
  ) {
    await this.findOne(userId, taskId);

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: updateTaskDto,
    });
  }

  async remove(
    userId: number,
    taskId: number,
  ) {
    await this.findOne(userId, taskId);

    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return {
      message: `Task ${taskId} deleted successfully`,
    };
  }
}
