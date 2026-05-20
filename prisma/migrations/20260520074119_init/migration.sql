-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'health_worker', 'admin', 'superadmin');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "GrowthSource" AS ENUM ('manual', 'import', 'sync');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "ImmunizationStatus" AS ENUM ('done', 'pending', 'skipped');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('unread', 'read', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "phone_number" VARCHAR(30),
    "password_hash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "status" "AccountStatus" NOT NULL DEFAULT 'active',
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "gender" "Gender" NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "place_of_birth" VARCHAR(150),
    "blood_type" VARCHAR(5),
    "photo_url" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "growth_records" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "measured_at" DATE NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "height_cm" DECIMAL(5,2) NOT NULL,
    "head_circumference_cm" DECIMAL(5,2),
    "z_score_weight" DECIMAL(6,2),
    "z_score_height" DECIMAL(6,2),
    "z_score_bmi" DECIMAL(6,2),
    "recorded_by_user_id" UUID,
    "source" "GrowthSource" NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "client_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "growth_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_journals" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "journal_date" DATE NOT NULL,
    "total_calories" INTEGER,
    "total_protein_g" DECIMAL(6,2),
    "total_carb_g" DECIMAL(6,2),
    "total_fat_g" DECIMAL(6,2),
    "total_water_ml" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "notes" TEXT,
    "client_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_meals" (
    "id" UUID NOT NULL,
    "nutrition_journal_id" UUID NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "subtitle" VARCHAR(200),
    "calories" INTEGER,
    "portion" VARCHAR(100),
    "status_label" VARCHAR(50),
    "status_color" VARCHAR(30),
    "consumed_at" TIMESTAMP(3),
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "ai_confidence" DECIMAL(3,2),
    "raw_input" TEXT,
    "client_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hydration_logs" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "log_date" DATE NOT NULL,
    "cups_target" INTEGER NOT NULL,
    "cups_consumed" INTEGER NOT NULL,
    "unit" VARCHAR(20) NOT NULL DEFAULT 'cups',
    "notes" TEXT,
    "client_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hydration_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "who_growth_standards" (
    "id" SERIAL NOT NULL,
    "gender" "Gender" NOT NULL,
    "age_months" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "sd3neg" DECIMAL(6,2) NOT NULL,
    "sd2neg" DECIMAL(6,2) NOT NULL,
    "sd1neg" DECIMAL(6,2) NOT NULL,
    "median" DECIMAL(6,2) NOT NULL,
    "sd1" DECIMAL(6,2) NOT NULL,
    "sd2" DECIMAL(6,2) NOT NULL,
    "sd3" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "who_growth_standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "immunization_definitions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "schedule_age_months" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "immunization_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "immunization_records" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "immunization_definition_id" UUID NOT NULL,
    "given_at" DATE,
    "status" "ImmunizationStatus" NOT NULL DEFAULT 'pending',
    "facility_name" VARCHAR(150),
    "batch_number" VARCHAR(100),
    "note" TEXT,
    "client_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "immunization_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posyandu_schedules" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_by_user_id" UUID,
    "client_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posyandu_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_id" VARCHAR(150) NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "child_id" UUID,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'unread',
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "before_data" JSONB,
    "after_data" JSONB,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "children_user_id_idx" ON "children"("user_id");

-- CreateIndex
CREATE INDEX "children_date_of_birth_idx" ON "children"("date_of_birth");

-- CreateIndex
CREATE INDEX "growth_records_child_id_measured_at_idx" ON "growth_records"("child_id", "measured_at");

-- CreateIndex
CREATE INDEX "nutrition_journals_child_id_journal_date_idx" ON "nutrition_journals"("child_id", "journal_date");

-- CreateIndex
CREATE INDEX "nutrition_meals_nutrition_journal_id_meal_type_idx" ON "nutrition_meals"("nutrition_journal_id", "meal_type");

-- CreateIndex
CREATE INDEX "hydration_logs_child_id_log_date_idx" ON "hydration_logs"("child_id", "log_date");

-- CreateIndex
CREATE INDEX "who_growth_standards_gender_metric_age_months_idx" ON "who_growth_standards"("gender", "metric", "age_months");

-- CreateIndex
CREATE UNIQUE INDEX "who_growth_standards_gender_metric_age_months_key" ON "who_growth_standards"("gender", "metric", "age_months");

-- CreateIndex
CREATE UNIQUE INDEX "immunization_definitions_code_key" ON "immunization_definitions"("code");

-- CreateIndex
CREATE INDEX "immunization_records_child_id_immunization_definition_id_idx" ON "immunization_records"("child_id", "immunization_definition_id");

-- CreateIndex
CREATE INDEX "posyandu_schedules_child_id_scheduled_at_idx" ON "posyandu_schedules"("child_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_device_id_idx" ON "device_tokens"("user_id", "device_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_status_idx" ON "notifications"("user_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_records" ADD CONSTRAINT "growth_records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_records" ADD CONSTRAINT "growth_records_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_journals" ADD CONSTRAINT "nutrition_journals_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_meals" ADD CONSTRAINT "nutrition_meals_nutrition_journal_id_fkey" FOREIGN KEY ("nutrition_journal_id") REFERENCES "nutrition_journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hydration_logs" ADD CONSTRAINT "hydration_logs_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_immunization_definition_id_fkey" FOREIGN KEY ("immunization_definition_id") REFERENCES "immunization_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posyandu_schedules" ADD CONSTRAINT "posyandu_schedules_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posyandu_schedules" ADD CONSTRAINT "posyandu_schedules_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
