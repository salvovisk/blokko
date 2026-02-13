import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const demoPassword = await hash('demo123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@blokko.com' },
    update: {},
    create: {
      email: 'demo@blokko.com',
      name: 'Demo User',
      password: demoPassword,
    },
  });

  console.log('✅ Demo user created:');
  console.log('   Email: demo@blokko.com');
  console.log('   Password: demo123');
  console.log('   ID:', demoUser.id);

  // Create a sample quote for demo user
  const sampleQuote = await prisma.quote.create({
    data: {
      userId: demoUser.id,
      title: 'Sample Quote - Website Design',
      description: 'Professional website design and development',
      status: 'draft',
      content: {
        blocks: [
          {
            id: '1',
            type: 'HEADER',
            data: {
              companyName: 'BLOKKO',
              clientName: 'Sample Client',
              date: new Date().toISOString(),
            },
          },
          {
            id: '2',
            type: 'PRICES',
            data: {
              items: [
                { description: 'Website Design', quantity: 1, price: 2500 },
                { description: 'Development', quantity: 40, price: 100 },
                { description: 'Testing & QA', quantity: 8, price: 80 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Sample quote created:', sampleQuote.title);
  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('You can now login with:');
  console.log('  Email: demo@blokko.com');
  console.log('  Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
