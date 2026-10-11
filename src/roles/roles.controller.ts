
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

import { AssignPermissionsDto } from './dto/assign-permissions.dto.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { RolesService } from './roles.service.js';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Get()
  @Permissions('ROLE_READ')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @Permissions('PERMISSION_READ')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Post()
  @Permissions('ROLE_CREATE')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Patch(':id/permissions')
  @Permissions('ROLE_ASSIGN_PERMISSIONS')
  assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(
      id,
      assignPermissionsDto.permissionIds,
    );
  }
}
