
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const userRole = await this.prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (!userRole) {
      throw new NotFoundException('USER role not found');
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      10,
    );

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        roleId: userRole.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async assignRole(
    userId: number,
    roleId: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newRole = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!newRole) {
      throw new NotFoundException('Role not found');
    }

    if (
      user.role.name === 'ADMIN' &&
      newRole.name !== 'ADMIN'
    ) {
      const adminCount = await this.prisma.user.count({
        where: {
          role: {
            name: 'ADMIN',
          },
        },
      });

      if (adminCount === 1) {
        throw new ConflictException(
          'Cannot demote the last admin',
        );
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roleId: newRole.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      updateUserDto.email &&
      updateUserDto.email !== user.email
    ) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const data: {
      name?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    if (updateUserDto.name !== undefined) {
      data.name = updateUserDto.name;
    }

    if (updateUserDto.email !== undefined) {
      data.email = updateUserDto.email;
    }

    if (updateUserDto.password !== undefined) {
      data.passwordHash = await bcrypt.hash(
        updateUserDto.password,
        10,
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role.name === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: {
          role: {
            name: 'ADMIN',
          },
        },
      });

      if (adminCount === 1) {
        throw new ConflictException(
          'Cannot delete the last admin',
        );
      }
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: `User ${user.id} deleted successfully`,
    };
  }
}
