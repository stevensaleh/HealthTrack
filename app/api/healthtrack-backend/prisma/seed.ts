import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting database seeding');

  // Create a test user with email/password
  const hashedPassword: string = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'test@healthtrack.com' },
    update: {},
    create: {
      email: 'test@healthtrack.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  console.log('✅ Created test user:', user1.email);

  // Create a Google OAuth user
  const user2 = await prisma.user.upsert({
    where: { email: 'google@healthtrack.com' },
    update: {},
    create: {
      email: 'google@healthtrack.com',
      googleId: 'google-oauth-id-123',
      firstName: 'Jane',
      lastName: 'Smith',
      profileImage: 'https://via.placeholder.com/150',
    },
  });

  console.log('✅ Created Google OAuth user:', user2.email);

  // Create sample health data for user1
  const today = new Date();
  const healthDataEntries: Array<{
    userId: string;
    date: Date;
    weight: number;
    steps: number;
    calories: number;
    sleep: number;
    water: number;
    exercise: number;
    heartRate: number;
    mood: string;
  }> = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    healthDataEntries.push({
      userId: user1.id,
      date: date,
      weight: 75 - i * 0.2, // Gradual weight loss
      steps: 8000 + Math.floor(Math.random() * 4000),
      calories: 2000 + Math.floor(Math.random() * 500),
      sleep: 7 + Math.random() * 2,
      water: 2 + Math.random() * 1,
      exercise: 30 + Math.floor(Math.random() * 60),
      heartRate: 70 + Math.floor(Math.random() * 20),
      mood: ['happy', 'energetic', 'tired', 'neutral'][
        Math.floor(Math.random() * 4)
      ],
    });
  }

  await prisma.healthData.createMany({
    data: healthDataEntries,
  });

  console.log('Created 7 days of health data for test user');

  // Create sample goals for user1
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);

  const goal1 = await prisma.goal.create({
    data: {
      userId: user1.id,
      title: 'Lose 5kg',
      description: 'Lose 5kg in 3 months through healthy eating and exercise',
      type: 'WEIGHT_LOSS',
      targetValue: 70,
      startValue: 75,
      endDate: futureDate,
      status: 'ACTIVE',
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      userId: user1.id,
      title: 'Walk 10,000 steps daily',
      description: 'Achieve 10,000 steps every day',
      type: 'STEPS',
      targetValue: 10000,
      startValue: 8500,
      endDate: futureDate,
      status: 'ACTIVE',
    },
  });

  console.log('Created 2 goals for test user');

  // Create a sample integration
  const integration = await prisma.integration.create({
    data: {
      userId: user1.id,
      provider: 'GOOGLE_FIT',
      accessToken: 'sample-access-token',
      refreshToken: 'sample-refresh-token',
      isActive: true,
    },
  });

  console.log('Created sample integration for test user');

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('Test credentials:');
  console.log('  Email: test@healthtrack.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
