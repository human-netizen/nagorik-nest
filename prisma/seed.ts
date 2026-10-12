
import 'dotenv/config';

import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Seeding RBAC data...');

  const permissions = [
    'USER_READ',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'ROLE_READ',
    'TASK_CREATE',
    'TASK_READ',
    'TASK_UPDATE',
    'TASK_DELETE',
    'TASK_ASSIGN',
    'TASK_MANAGE_ALL',
    'USER_ASSIGN_ROLE'
  ];

  for (const permissionName of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permissionName,
      },
      update: {},
      create: {
        name: permissionName,
      },
    });
  }

  const adminRole = await prisma.role.upsert({
    where: {
      name: 'ADMIN',
    },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Full system access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: {
      name: 'USER',
    },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard user access',
    },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const userPermissions = allPermissions.filter(
    (permission) =>
      [
        'TASK_CREATE',
        'TASK_READ',
        'TASK_UPDATE',
        'TASK_DELETE',
      ].includes(permission.name),
  );

  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('Permissions and role assignments completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
