import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { PrismaService } from '../../prisma/prisma.service.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {


    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

  
    if (!requiredPermissions) {
      return true;
    }


    const request = context.switchToHttp().getRequest();


    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'User not authenticated',
      );
    }


    const databaseUser = await this.prisma.user.findUnique({
      where: {
        id: user.userId,
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


    if (!databaseUser) {
      throw new ForbiddenException(
        'User not found',
      );
    }


    const userPermissions =
      databaseUser.role.permissions.map(
        (rolePermission) =>
          rolePermission.permission.name,
      );


    const hasAllRequiredPermissions =
      requiredPermissions.every(
        (requiredPermission) =>
          userPermissions.includes(requiredPermission),
      );


    if (!hasAllRequiredPermissions) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }


    return true;
  }
}