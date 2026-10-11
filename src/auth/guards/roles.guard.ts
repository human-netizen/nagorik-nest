import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<string[]>(
    ROLES_KEY,
    [context.getHandler(), context.getClass()],
  );

  if (!requiredRoles) {
    return true;
  }

  const request = context.switchToHttp().getRequest();

  const user = request.user;

  if (!user) {
    throw new ForbiddenException('User not authenticated');
  }

  return requiredRoles.includes(user.role);
}
}