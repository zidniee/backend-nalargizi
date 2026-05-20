import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import {
  TransformInterceptor,
  ApiResponse,
} from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { randomUUID } from 'crypto';

describe('NalarGizi Full E2E Test Suite', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Test states to pass between sequential tests
  let authToken: string;
  let testUserId: string;
  const testUserEmail = `test.e2e.${randomUUID()}@example.com`;
  const testUserPassword = 'SecurePassword123!';
  const testUserPhone = `+62812${Math.floor(10000000 + Math.random() * 90000000)}`;

  const childId = randomUUID();
  const growthRecordId = randomUUID();
  const journalId = randomUUID();
  const mealId = randomUUID();
  const hydrationLogId = randomUUID();
  const scheduleId = randomUUID();
  const immunizationRecordId = randomUUID();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');

    // Configure global middlewares identical to main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Cascading delete on the created test user cleans up all child-related records automatically.
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
    await app.close();
  });

  // 1. Auth Flow
  describe('Auth Flow', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test E2E Parent User',
          email: testUserEmail,
          phoneNumber: testUserPhone,
          password: testUserPassword,
        })
        .expect(201);

      const body = response.body as ApiResponse<{
        user: { id: string; email: string };
      }>;
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe(testUserEmail);
      testUserId = body.data.user.id;
    });

    it('should log in and return JWT tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUserEmail,
          password: testUserPassword,
        })
        .expect(200);

      const body = response.body as ApiResponse<{
        tokens: { accessToken: string; refreshToken: string };
      }>;
      expect(body.success).toBe(true);
      expect(body.data.tokens.accessToken).toBeDefined();
      authToken = body.data.tokens.accessToken;
    });

    it('should retrieve current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body = response.body as ApiResponse<{ email: string }>;
      expect(body.success).toBe(true);
      expect(body.data.email).toBe(testUserEmail);
    });
  });

  // 2. Children Flow
  describe('Children Management Flow', () => {
    it('should create a child profile with client-side UUID', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/children')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: childId,
          fullName: 'Anak Test E2E',
          gender: 'male',
          dateOfBirth: '2025-01-01T00:00:00.000Z',
          placeOfBirth: 'Jakarta',
          bloodType: 'O',
          photoUrl: 'https://example.com/photo.jpg',
          notes: 'Catatan anak test',
        })
        .expect(201);

      const body = response.body as ApiResponse<{ id: string }>;
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(childId);
    });

    it("should list user's children profiles", async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/children')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body = response.body as ApiResponse<Array<{ id: string }>>;
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].id).toBe(childId);
    });

    it('should get child profile by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/children/${childId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body = response.body as ApiResponse<{ id: string }>;
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(childId);
    });

    it('should update child profile info', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/children/${childId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Anak Test E2E Updated',
        })
        .expect(200);

      const body = response.body as ApiResponse<{ fullName: string }>;
      expect(body.success).toBe(true);
      expect(body.data.fullName).toBe('Anak Test E2E Updated');
    });
  });

  // 3. Growth Flow
  describe('Growth Monitoring Flow', () => {
    beforeAll(async () => {
      // Seed WHO Growth Standards for Male, 16 months, weight & height & BMI metrics
      await prisma.whoGrowthStandard.upsert({
        where: {
          gender_metric_ageMonths: {
            gender: 'male',
            metric: 'weight',
            ageMonths: 16,
          },
        },
        update: {},
        create: {
          gender: 'male',
          metric: 'weight',
          ageMonths: 16,
          sd3neg: 8.2,
          sd2neg: 9.0,
          sd1neg: 10.0,
          median: 11.2,
          sd1: 12.5,
          sd2: 13.7,
          sd3: 15.0,
        },
      });

      await prisma.whoGrowthStandard.upsert({
        where: {
          gender_metric_ageMonths: {
            gender: 'male',
            metric: 'height',
            ageMonths: 16,
          },
        },
        update: {},
        create: {
          gender: 'male',
          metric: 'height',
          ageMonths: 16,
          sd3neg: 73.0,
          sd2neg: 76.0,
          sd1neg: 79.0,
          median: 82.0,
          sd1: 85.0,
          sd2: 88.0,
          sd3: 91.0,
        },
      });

      await prisma.whoGrowthStandard.upsert({
        where: {
          gender_metric_ageMonths: {
            gender: 'male',
            metric: 'bmi',
            ageMonths: 16,
          },
        },
        update: {},
        create: {
          gender: 'male',
          metric: 'bmi',
          ageMonths: 16,
          sd3neg: 13.0,
          sd2neg: 13.7,
          sd1neg: 14.5,
          median: 15.5,
          sd1: 16.7,
          sd2: 18.0,
          sd3: 19.5,
        },
      });
    });

    it('should log a new growth record and automatically populate Z-scores', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/growth-records`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: growthRecordId,
          measuredAt: '2026-05-01T00:00:00.000Z', // Child age at ~16 months
          weightKg: 11.2,
          heightCm: 82.0,
          headCircumferenceCm: 45.5,
          source: 'manual',
          notes: 'Pengukuran sehat',
        })
        .expect(201);

      const body = response.body as ApiResponse<{
        id: string;
        zScoreWeight: number;
        zScoreHeight: number;
      }>;
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(growthRecordId);
      expect(Number(body.data.zScoreWeight)).toBeCloseTo(0, 1);
      expect(Number(body.data.zScoreHeight)).toBeCloseTo(0, 1);
    });

    it('should list growth records for child', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/growth-records`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body = response.body as ApiResponse<Array<{ id: string }>>;
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve WHO standard boundaries', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/growth-standards')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          gender: 'male',
          metric: 'weight',
        })
        .expect(200);

      const body = response.body as ApiResponse<Array<{ ageMonths: number }>>;
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 4. Nutrition & Hydration Flow
  describe('Nutrition & Hydration Flow', () => {
    it('should log a nutrition journal entry', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/nutrition-journals`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: journalId,
          journalDate: '2026-05-20T00:00:00.000Z',
          notes: 'Jurnal harian makanan',
        })
        .expect(201);

      const body = response.body as ApiResponse<{ id: string }>;
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(journalId);
    });

    it('should add a meal log inside the journal', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/nutrition-journals/${journalId}/meals`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: mealId,
          mealType: 'breakfast',
          title: 'Bubur Ayam',
          subtitle: 'Bubur ayam wortel telur puyuh',
          calories: 250,
          portion: '1 mangkok',
          statusLabel: 'Habis',
          statusColor: 'green',
        })
        .expect(201);

      const body = response.body as ApiResponse<{ id: string }>;
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(mealId);
    });

    it('should list nutrition journals for child', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/nutrition-journals`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body = response.body as ApiResponse<Array<{ id: string }>>;
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should update meal details', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/nutrition-meals/${mealId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Bubur Ayam Spesial',
        })
        .expect(200);

      const body = response.body as ApiResponse<{ title: string }>;
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Bubur Ayam Spesial');
    });

    it('should log hydration intake log', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/hydration-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: hydrationLogId,
          logDate: new Date().toISOString(),
          cupsTarget: 8,
          cupsConsumed: 4,
          unit: 'cups',
          notes: 'Minum air putih pagi-siang',
        })
        .expect(201);

      const body = response.body as ApiResponse<{ id: string }>;
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(hydrationLogId);
    });

    it('should retrieve hydration logs for today', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/hydration-logs/today`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body = response.body as ApiResponse<{ cupsConsumed: number }>;
      expect(body.success).toBe(true);
      expect(body.data.cupsConsumed).toBe(4);
    });

    it('should query AI Nutrition analysis from text description (gemini fallback)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/nutrition/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Makan nasi goreng telur dadar satu piring',
        })
        .expect(201);

      const body = response.body as ApiResponse<{ calories: number }>;
      expect(body.success).toBe(true);
      expect(body.data.calories).toBeDefined();
    });
  });

  // 5. Posyandu & Immunizations Flow
  describe('Posyandu & Immunizations Flow', () => {
    let vaccineDefId: string;

    beforeAll(async () => {
      // Seed a vaccine definition
      const def = await prisma.immunizationDefinition.upsert({
        where: { code: 'BCG_E2E' },
        update: {},
        create: {
          code: 'BCG_E2E',
          name: 'BCG E2E Vaccine',
          scheduleAgeMonths: 1,
          description: 'Vaksinasi TBC',
        },
      });
      vaccineDefId = def.id;
    });

    it('should schedule a Posyandu visit', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/posyandu-schedules`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: scheduleId,
          title: 'Timbang Rutin Mei',
          category: 'Timbang',
          location: 'Posyandu Melati',
          scheduledAt: '2026-05-25T09:00:00.000Z',
          note: 'Bawa KMS',
        })
        .expect(201);

      const body = response.body as ApiResponse<{ id: string }>;
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(scheduleId);
    });

    it('should mark scheduled visit completed', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/posyandu-schedules/${scheduleId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedAt: '2026-05-25T10:00:00.000Z',
        })
        .expect(200);

      const body = response.body as ApiResponse<{ isCompleted: boolean }>;
      expect(body.success).toBe(true);
      expect(body.data.isCompleted).toBe(true);
    });

    it('should fetch Posyandu schedule overview', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/posyandu/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          childId: childId,
        })
        .expect(200);

      const body = response.body as ApiResponse<{
        completedSchedules: Array<{ id: string }>;
        upcomingSchedules: Array<{ id: string }>;
      }>;
      expect(body.success).toBe(true);
      expect(body.data.completedSchedules.length).toBeGreaterThanOrEqual(1);
    });

    it('should create an immunization record', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/immunization-records`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: immunizationRecordId,
          immunizationDefinitionId: vaccineDefId,
          givenAt: '2026-05-20T00:00:00.000Z',
          status: 'done',
          facilityName: 'Puskesmas E2E',
          batchNumber: 'BATCH-001',
          note: 'Disuntik lengan kanan',
        })
        .expect(201);

      const body = response.body as ApiResponse<{ id: string }>;
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(immunizationRecordId);
    });

    it('should list immunization status history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/children/${childId}/immunization-records`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body = response.body as ApiResponse<Array<{ id: string }>>;
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 6. Bulk Offline Sync Flow
  describe('Bulk Offline Synchronization Flow', () => {
    const syncGrowthId = randomUUID();
    const syncMealId = randomUUID();

    it('should perform bulk sync operations for multiple offline actions', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          operations: [
            {
              action: 'create',
              type: 'growth',
              clientUniqueId: syncGrowthId,
              data: {
                childId: childId,
                measuredAt: '2026-05-10T00:00:00.000Z',
                weightKg: 12.0,
                heightCm: 84.0,
                headCircumferenceCm: 46.0,
                notes: 'Sync offline log',
              },
            },
            {
              action: 'create',
              type: 'meal',
              clientUniqueId: syncMealId,
              data: {
                nutritionJournalId: journalId,
                mealType: 'lunch',
                title: 'Nasi Sup Sayur',
                calories: 300,
                portion: '1 piring',
              },
            },
          ],
        })
        .expect(200);

      const body = response.body as ApiResponse<{
        results: Array<{ status: string }>;
      }>;
      expect(body.success).toBe(true);
      expect(body.data.results.length).toBe(2);
      expect(body.data.results[0].status).toBe('synced');
    });

    it('should flag conflict when incoming update version is older than server', async () => {
      // 1. Fetch server state of the growth record just created
      const originalRecord = await prisma.growthRecord.findUnique({
        where: { id: syncGrowthId },
      });
      expect(originalRecord).toBeDefined();
      const serverLastModified = originalRecord!.lastModifiedAt.toISOString();

      // 2. Set server record to have a newer modification date
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour in future
      await prisma.growthRecord.update({
        where: { id: syncGrowthId },
        data: { lastModifiedAt: futureDate },
      });

      // 3. Sync update from client with an older lastModifiedAt timestamp
      const response = await request(app.getHttpServer())
        .post('/api/v1/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          operations: [
            {
              action: 'update',
              type: 'growth',
              clientUniqueId: syncGrowthId,
              data: {
                childId: childId,
                measuredAt: '2026-05-10T00:00:00.000Z',
                weightKg: 12.5,
                heightCm: 84.0,
                lastModifiedAt: serverLastModified, // Older than futureDate in database
              },
            },
          ],
        })
        .expect(200);

      const body = response.body as ApiResponse<{
        hasConflicts: boolean;
        results: Array<{ status: string }>;
      }>;
      // success is false because there are conflicts
      expect(body.success).toBe(false);
      expect(body.data.hasConflicts).toBe(true);
      expect(body.data.results[0].status).toBe('conflict');
    });
  });
});
