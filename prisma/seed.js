const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clean up
  await prisma.task.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const password = await bcrypt.hash('password123', 10);
  
  const ayush = await prisma.user.create({
    data: { name: 'Ayush', email: 'admin@vortex.io', password, role: 'ADMIN' }
  });
  
  const sarah = await prisma.user.create({
    data: { name: 'Sarah Chen', email: 'sarah@vortex.io', password, role: 'MEMBER' }
  });
  
  const marcus = await prisma.user.create({
    data: { name: 'Marcus Johnson', email: 'marcus@vortex.io', password, role: 'MEMBER' }
  });

  // Create Workspaces
  const ws1 = await prisma.workspace.create({
    data: {
      name: 'Product Launch Q3',
      description: 'Cross-functional workspace for the Q3 product release cycle',
      ownerId: ayush.id,
      members: {
        create: [
          { userId: ayush.id, role: 'ADMIN' },
          { userId: sarah.id, role: 'MEMBER' },
          { userId: marcus.id, role: 'MEMBER' }
        ]
      }
    }
  });

  // Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Implement user authentication flow',
        description: 'Set up JWT-based auth with refresh token rotation',
        status: 'ACTIVE',
        priority: 'HIGH',
        workspaceId: ws1.id,
        assigneeId: marcus.id,
        creatorId: ayush.id,
        tags: ['backend', 'security']
      },
      {
        title: 'Design landing page hero section',
        description: 'Create a responsive hero with animated gradients and CTA',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        workspaceId: ws1.id,
        assigneeId: sarah.id,
        creatorId: ayush.id,
        tags: ['design', 'frontend']
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'PENDING',
        priority: 'HIGH',
        workspaceId: ws1.id,
        creatorId: ayush.id,
        tags: ['devops']
      }
    ]
  });

  console.log('Seeding complete! ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
