import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn', 'info'],
});

async function test() {
  try {
    console.log('Testing Prisma connection...');

    // Try to count services
    const count = await prisma.service.count();
    console.log(`✅ Success! Found ${count} services`);

    // Try to find all services
    const services = await prisma.service.findMany();
    console.log(`✅ Services:`, services);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
