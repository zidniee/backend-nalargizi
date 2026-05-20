import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Parent User
  const passwordHash = await bcrypt.hash('SecurePassword123!', 10);
  const parentUser = await prisma.user.upsert({
    where: { email: 'budi.test@example.com' },
    update: {},
    create: {
      id: 'a67e4369-0268-45d2-a74c-4e881447bc2a',
      fullName: 'Budi Santoso',
      email: 'budi.test@example.com',
      phoneNumber: '+6281234567890',
      passwordHash,
      role: 'user',
      status: 'active',
    },
  });
  console.log(`👤 Seeded parent user: ${parentUser.email}`);

  // 2. Seed Child Profile
  const child = await prisma.child.upsert({
    where: { id: 'b6a71e84-1845-4299-90b5-e6a881447bd1' },
    update: {},
    create: {
      id: 'b6a71e84-1845-4299-90b5-e6a881447bd1',
      userId: parentUser.id,
      fullName: 'Aris Santoso',
      gender: 'male',
      dateOfBirth: new Date('2025-01-01T00:00:00.000Z'),
      placeOfBirth: 'Jakarta',
      bloodType: 'O',
      photoUrl: 'https://example.com/aris.jpg',
      notes: 'Lahir prematur 1 minggu',
    },
  });
  console.log(`👶 Seeded child profile: ${child.fullName}`);

  // 3. Seed WHO Growth Standards for age 0 to 24 months (subset for demo/testing)
  console.log('📈 Seeding WHO Growth Standards...');
  const ageMonthsList = [0, 1, 3, 6, 12, 16, 18, 24];
  const metrics = ['weight', 'height', 'bmi'];
  const genders = ['male', 'female'] as const;

  for (const gender of genders) {
    for (const metric of metrics) {
      for (const age of ageMonthsList) {
        // Values are illustrative mock boundaries corresponding to WHO standards
        let median = 0;
        let diff = 0;

        if (metric === 'weight') {
          // Weight mock progression
          median = 3.3 + age * 0.4;
          diff = 0.5 + age * 0.05;
        } else if (metric === 'height') {
          // Height mock progression
          median = 50.0 + age * 1.5;
          diff = 2.0 + age * 0.1;
        } else {
          // BMI mock progression
          median = 13.5 + (age > 12 ? -0.05 : 0.15) * age;
          diff = 0.8 + age * 0.02;
        }

        await prisma.whoGrowthStandard.upsert({
          where: {
            gender_metric_ageMonths: {
              gender,
              metric,
              ageMonths: age,
            },
          },
          update: {},
          create: {
            gender,
            metric,
            ageMonths: age,
            sd3neg: median - 3 * diff,
            sd2neg: median - 2 * diff,
            sd1neg: median - 1 * diff,
            median: median,
            sd1: median + 1 * diff,
            sd2: median + 2 * diff,
            sd3: median + 3 * diff,
          },
        });
      }
    }
  }

  // 4. Seed Growth Records for Child (at age 0, 6, and 12 months)
  console.log('📏 Seeding Child Growth Records...');
  const growthData = [
    {
      id: 'c7b82f95-2956-53aa-01c6-f7b881447be2',
      measuredAt: new Date('2025-01-01T00:00:00.000Z'), // age 0
      weightKg: 3.3,
      heightCm: 50.0,
      headCircumferenceCm: 34.5,
      zScoreWeight: 0.0,
      zScoreHeight: 0.0,
      zScoreBmi: 0.0,
      notes: 'Pengukuran baru lahir',
    },
    {
      id: 'c7b82f95-2956-53aa-01c6-f7b881447be3',
      measuredAt: new Date('2025-07-01T00:00:00.000Z'), // age 6
      weightKg: 5.7,
      heightCm: 59.0,
      headCircumferenceCm: 41.5,
      zScoreWeight: 0.0,
      zScoreHeight: 0.0,
      zScoreBmi: 0.0,
      notes: 'Pengukuran 6 bulan',
    },
  ];

  for (const record of growthData) {
    await prisma.growthRecord.upsert({
      where: { id: record.id },
      update: {},
      create: {
        id: record.id,
        childId: child.id,
        measuredAt: record.measuredAt,
        weightKg: record.weightKg,
        heightCm: record.heightCm,
        headCircumferenceCm: record.headCircumferenceCm,
        zScoreWeight: record.zScoreWeight,
        zScoreHeight: record.zScoreHeight,
        zScoreBmi: record.zScoreBmi,
        notes: record.notes,
        source: 'manual',
      },
    });
  }

  // 5. Seed Immunization Definitions
  console.log('💉 Seeding Immunization Definitions...');
  const vaccineDefs = [
    {
      id: '2d0c8f5b-8fbc-b9ff-67fc-fcfe46881f48',
      code: 'HB0',
      name: 'Hepatitis B 0',
      scheduleAgeMonths: 0,
      description: 'Mencegah infeksi virus Hepatitis B pada hati, diberikan < 24 jam setelah lahir.',
    },
    {
      id: '2d0c8f5b-8fbc-b9ff-67fc-fcfe46881f49',
      code: 'BCG',
      name: 'BCG',
      scheduleAgeMonths: 1,
      description: 'Mencegah penyakit Tuberkulosis (TBC) paru, otak, dan tulang.',
    },
    {
      id: '2d0c8f5b-8fbc-b9ff-67fc-fcfe46881f50',
      code: 'DPT_HB_HIB1',
      name: 'DPT-HB-Hib 1',
      scheduleAgeMonths: 2,
      description: 'Mencegah Difteri, Pertusis, Tetanus, Hepatitis B, meningitis & pneumonia.',
    },
  ];

  for (const v of vaccineDefs) {
    await prisma.immunizationDefinition.upsert({
      where: { code: v.code },
      update: {},
      create: v,
    });
  }

  // 6. Seed Child Immunization Records (Hepatitis B given at birth)
  console.log('🏥 Seeding Child Immunization Records...');
  await prisma.immunizationRecord.upsert({
    where: { id: '1cfb7e4a-7eab-a8ff-56fb-ebfd35770f37' },
    update: {},
    create: {
      id: '1cfb7e4a-7eab-a8ff-56fb-ebfd35770f37',
      childId: child.id,
      immunizationDefinitionId: '2d0c8f5b-8fbc-b9ff-67fc-fcfe46881f48',
      givenAt: new Date('2025-01-01T00:00:00.000Z'),
      status: 'done',
      facilityName: 'Puskesmas Melati',
      batchNumber: 'VAKSIN-HB-001',
      note: 'Diberikan langsung sesaat setelah lahir',
    },
  });

  // 7. Seed Posyandu Schedule (1 Completed, 1 Upcoming)
  console.log('📅 Seeding Posyandu Schedules...');
  await prisma.posyanduSchedule.upsert({
    where: { id: '0bfa6d39-6d9a-97ee-45fa-daec24669e26' },
    update: {},
    create: {
      id: '0bfa6d39-6d9a-97ee-45fa-daec24669e26',
      childId: child.id,
      title: 'Timbang Rutin & Imunisasi BCG',
      category: 'Timbang & Imunisasi',
      location: 'Posyandu Melati',
      scheduledAt: new Date('2025-02-05T09:00:00.000Z'),
      note: 'Bawa buku KIA/KMS',
      isCompleted: true,
      completedAt: new Date('2025-02-05T10:00:00.000Z'),
      createdByUserId: parentUser.id,
    },
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  await prisma.posyanduSchedule.upsert({
    where: { id: '0bfa6d39-6d9a-97ee-45fa-daec24669e27' },
    update: {},
    create: {
      id: '0bfa6d39-6d9a-97ee-45fa-daec24669e27',
      childId: child.id,
      title: 'Posyandu Rutin Bulanan',
      category: 'Timbang',
      location: 'Posyandu Melati',
      scheduledAt: nextWeek,
      note: 'Pengukuran tinggi dan berat badan berkala',
      isCompleted: false,
      createdByUserId: parentUser.id,
    },
  });

  // 8. Seed Nutrition Journal & Meals for Today
  console.log('🍽️ Seeding Nutrition Journal & Meals...');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayJournal = await prisma.nutritionJournal.upsert({
    where: { id: 'd8c93a06-3a67-64bb-12d7-a8b991447bf3' },
    update: {},
    create: {
      id: 'd8c93a06-3a67-64bb-12d7-a8b991447bf3',
      childId: child.id,
      journalDate: new Date(todayStr),
      notes: 'Hari ini makannya lahap sekali',
    },
  });

  const mealItems = [
    {
      id: 'e9da4b17-4b78-75cc-23e8-b9ca02447c04',
      mealType: 'breakfast' as const,
      title: 'Bubur Wortel Ayam',
      subtitle: 'Nasi tim lumat wortel brokoli ayam cincang',
      calories: 220,
      portion: '1 mangkok kecil',
      statusLabel: 'Habis',
      statusColor: 'green',
    },
    {
      id: 'e9da4b17-4b78-75cc-23e8-b9ca02447c05',
      mealType: 'lunch' as const,
      title: 'Puree Labu Kuning Daging Sapi',
      subtitle: 'Puree labu manis mentega dengan daging giling lembu',
      calories: 280,
      portion: '1 mangkok kecil',
      statusLabel: 'Sisa sedikit',
      statusColor: 'yellow',
    },
  ];

  for (const meal of mealItems) {
    await prisma.nutritionMeal.upsert({
      where: { id: meal.id },
      update: {},
      create: {
        id: meal.id,
        nutritionJournalId: todayJournal.id,
        mealType: meal.mealType,
        title: meal.title,
        subtitle: meal.subtitle,
        calories: meal.calories,
        portion: meal.portion,
        statusLabel: meal.statusLabel,
        statusColor: meal.statusColor,
      },
    });
  }

  // 9. Seed Hydration Log for Today
  console.log('💧 Seeding Hydration Log...');
  await prisma.hydrationLog.upsert({
    where: { id: 'faeb5c28-5c89-86dd-34f9-cadb13558d15' },
    update: {},
    create: {
      id: 'faeb5c28-5c89-86dd-34f9-cadb13558d15',
      childId: child.id,
      logDate: new Date(todayStr),
      cupsTarget: 8,
      cupsConsumed: 5,
      unit: 'cups',
      notes: 'Minum susu dan air mineral hangat berkala',
    },
  });

  console.log('✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
