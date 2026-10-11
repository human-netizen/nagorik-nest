
import {
  Body,
  Controller,
  Delete,
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

import { AssignRoleDto } from './dto/assign-role.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Permissions('USER_READ')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Permissions('USER_READ')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Permissions('USER_CREATE')
  create(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    return this.usersService.create(body);
  }

  @Patch(':id/role')
  @Permissions('USER_ASSIGN_ROLE')
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.usersService.assignRole(
      id,
      assignRoleDto.roleId,
    );
  }

  @Patch(':id')
  @Permissions('USER_UPDATE')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(
      id,
      updateUserDto,
    );
  }

  @Delete(':id')
  @Permissions('USER_DELETE')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.remove(id);
  }
}
