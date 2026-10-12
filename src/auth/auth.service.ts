import { ConflictException, Injectable , UnauthorizedException} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
) {}

async register(registerDto: RegisterDto) {
  const existingUser = await this.prisma.user.findUnique({
    where: {
      email: registerDto.email,
    },
  });

  if (existingUser) {
    throw new ConflictException('Email already exists');
  }

  const userRole = await this.prisma.role.findUnique({
    where: {
      name: 'USER',
    },
  });

  if (!userRole) {
    throw new Error('USER role not found. Run the Prisma seed.');
  }

  const passwordHash = await bcrypt.hash(registerDto.password, 10);

  const user = await this.prisma.user.create({
    data: {
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      roleId: userRole.id,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
  };
}

async getMe(userId: number) {
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
          permissions: {
            select: {
              permission: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: {
      id: user.role.id,
      name: user.role.name,
    },
    permissions: user.role.permissions.map(
      ({ permission }) => permission.name,
    ),
  };
}

async login(loginDto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: {
      email: loginDto.email,
    },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(
    loginDto.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new UnauthorizedException('Invalid email or password');
  }

const accessToken = this.jwtService.sign({
  sub: user.id,
  email: user.email,
});
  return {
    accessToken,
  };
}
}