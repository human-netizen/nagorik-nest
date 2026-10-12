import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the current role permissions with the user profile', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 12,
      name: 'Test User',
      email: 'test@example.com',
      role: {
        id: 2,
        name: 'USER',
        permissions: [
          { permission: { name: 'TASK_CREATE' } },
          { permission: { name: 'TASK_READ' } },
        ],
      },
    });

    await expect(service.getMe(12)).resolves.toEqual({
      userId: 12,
      name: 'Test User',
      email: 'test@example.com',
      role: {
        id: 2,
        name: 'USER',
      },
      permissions: ['TASK_CREATE', 'TASK_READ'],
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 12 },
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
  });
});
