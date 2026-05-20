# NalarGizi Backend

---

# 1. PROJECT OVERVIEW

## Nama Aplikasi
**NalarGizi**

## Tujuan Aplikasi
NalarGizi adalah aplikasi Flutter untuk membantu orang tua dan pengasuh memantau tumbuh kembang anak, terutama terkait:
- pertumbuhan fisik
- asupan nutrisi harian
- jadwal posyandu
- imunisasi
- ringkasan kesehatan anak

## Target User
- Orang tua / wali anak
- Pengasuh anak
- Petugas posyandu atau tenaga kesehatan komunitas
- Admin sistem kesehatan atau operator internal

## Masalah yang Diselesaikan
Aplikasi ini menyelesaikan beberapa masalah utama:
- data tumbuh kembang anak tersebar dan sulit dipantau secara konsisten
- jadwal posyandu dan imunisasi mudah terlewat
- pencatatan nutrisi harian masih manual
- orang tua sulit melihat ringkasan kesehatan anak dalam satu layar
- perlu ada sistem yang bisa mendukung lebih dari satu anak per akun

## Workflow Aplikasi
Berdasarkan source code Flutter yang tersedia, workflow utama aplikasi adalah:
1. User masuk ke onboarding/home screen.
2. User menuju dashboard utama.
3. User membuka modul:
   - Kurva pertumbuhan
   - Nutrisi harian
   - Posyandu dan imunisasi
   - Quick Add untuk input cepat
   - Profile
4. User melihat ringkasan, riwayat, dan jadwal.
5. Backend menyediakan data profil anak, catatan kesehatan, jadwal, dan status imunisasi.

## Platform
- Mobile Flutter
- Android
- iOS
- Potensial web/admin panel di masa depan

## Fitur Utama
- onboarding / landing flow
- dashboard ringkasan kesehatan
- kurva pertumbuhan berbasis standar WHO
- jurnal nutrisi harian
- jadwal posyandu
- status imunisasi
- quick add untuk input cepat
- profil pengguna / anak

## Fitur Premium Potensial
Tidak terlihat implementasi premium di source code, tetapi backend dapat disiapkan untuk:
- multi-child advanced analytics
- export PDF laporan tumbuh kembang
- pengingat cerdas berbasis notifikasi
- sinkronisasi offline-first
- akses peran petugas posyandu / admin fasilitas

---

# 2. FLUTTER APP ANALYSIS

## Folder Structure Analysis
Struktur aplikasi memakai pendekatan feature-first dengan lapisan mirip clean architecture:
- `lib/app/` untuk bootstrap aplikasi, router, layout, dan theme
- `lib/core/` untuk network dan exception global
- `lib/features/` untuk modul domain utama
- `lib/shared/` untuk widget reusable
- `assets/` untuk images, icons, fonts, dan lottie

Modul fitur yang terlihat:
- `auth`
- `dashboard`
- `growth`
- `home`
- `nutrition`
- `posyandu`
- `profile`
- `quick_add`
- `splash`

Pola internal per fitur umumnya:
- `domain/entities`
- `domain/repositories`
- `domain/usecases`
- `data/datasources`
- `data/models`
- `data/repositories`
- `presentation/bloc`
- `presentation/pages`
- `presentation/widgets`

Ini menunjukkan aplikasi sudah disiapkan untuk arsitektur modular dan backend-driven, walaupun sebagian fitur masih UI-first.

## Feature Analysis
### 1. Home / Onboarding
Halaman onboarding menampilkan 4 slide promosi:
- selamat datang
- kurva pertumbuhan WHO
- jurnal nutrisi harian
- jadwal posyandu dan imunisasi

Fungsi backend yang relevan:
- optional remote config untuk konten onboarding
- feature flag untuk menampilkan slide tertentu

### 2. Dashboard
Dashboard adalah halaman ringkasan utama yang berisi:
- header pengguna / anak
- status kesehatan
- tip harian
- indikator Z-score
- jadwal terdekat
- edukasi gizi
- banner posyandu

Fungsi backend yang relevan:
- endpoint ringkasan dashboard
- endpoint rekomendasi/tip harian
- endpoint jadwal terdekat
- endpoint status summary per anak

### 3. Growth
Modul growth menampilkan:
- pilihan tipe kurva: berat badan atau tinggi badan
- kartu pengukuran terakhir
- grafik kurva
- riwayat pertumbuhan

Fungsi backend yang relevan:
- endpoint data pengukuran growth
- endpoint seri waktu pertumbuhan
- endpoint referensi WHO / z-score
- endpoint riwayat pengukuran per anak

### 4. Nutrition
Modul nutrition menampilkan:
- ringkasan nutrisi harian
- blok waktu makan: sarapan, makan siang, makan malam
- daftar menu / MPASI
- hidrasi harian

Fungsi backend yang relevan:
- endpoint jurnal nutrisi harian
- endpoint meal entries
- endpoint hydration tracking
- endpoint progress nutrisi harian dan mingguan

### 5. Posyandu
Modul posyandu adalah satu-satunya modul yang benar-benar memanggil backend saat ini. UI-nya menampilkan:
- status imunisasi
- jadwal akan datang
- riwayat selesai
- kemampuan menambah event jadwal baru
- kemampuan menandai jadwal sebagai selesai

Fungsi backend yang relevan:
- endpoint overview posyandu
- endpoint daftar imunisasi
- endpoint jadwal posyandu
- endpoint update status jadwal

### 6. Quick Add
Quick Add adalah entry point untuk input cepat:
- catat berat dan tinggi
- jurnal nutrisi harian
- jadwal posyandu baru

Saat ini masih berupa bottom sheet UI dan snack bar, sehingga backend harus menyiapkan endpoint create untuk tiga jenis input tersebut.

### 7. Profile
Profil masih terlihat sebagai stub UI, tetapi backend tetap perlu menyediakan:
- data user
- data anak yang dipantau
- preferensi notifikasi
- identitas akun dan role

### 8. Auth
Modul auth masih sangat minimal di source code. Hanya ada login page placeholder. Artinya backend harus didesain penuh dari awal untuk autentikasi dan otorisasi.

## Screen/Page Analysis
Halaman yang terdeteksi:
- splash page
- home / onboarding page
- login page
- dashboard page
- growth page
- nutrition page
- posyandu page
- quick add page
- profile page

Navigasi utama memakai named routes pada `MaterialApp`.

## State Management Analysis
Aplikasi menggunakan `flutter_bloc` dengan pendekatan `Cubit`.

Pola yang terlihat:
- `DashboardCubit`
- `GrowthCubit`
- `NutritionCubit`
- `PosyanduCubit`
- `ProfileCubit`
- `QuickAddCubit`

Karakteristik pola state:
- state awal `initial`
- loading state sebelum load data
- success state setelah data siap
- failure state untuk error jaringan / error umum

Implikasi untuk backend:
- backend harus mengembalikan response yang konsisten agar state mudah dipetakan
- endpoint harus stabil dan deterministik
- error format harus jelas agar UI bisa menampilkan pesan yang tepat

## API Consumption Analysis
Frontend mengonsumsi backend melalui:
- `Dio`
- `PrettyDioLogger` saat debug
- base URL `https://api.nalargizi.dev`
- timeout 15 detik
- header JSON default
- fallback mock untuk data posyandu

Endpoint aktif yang ditemukan:
- `GET /posyandu/overview`

Ciri pola konsumsi backend:
- response diharapkan berbentuk JSON object
- model menggunakan `fromMap` / `toMap`
- data scheduled date dikirim dalam format ISO-8601 string
- backend harus mengembalikan field snake_case untuk beberapa array dan status boolean, misalnya `upcoming_schedules`, `completed_schedules`, `is_done`, `is_completed`

## Business Flow Analysis
### Flow Utama User
1. User membuka aplikasi.
2. User membaca onboarding.
3. User masuk ke dashboard.
4. User memeriksa kurva pertumbuhan.
5. User mencatat nutrisi.
6. User memeriksa jadwal posyandu dan imunisasi.
7. User melakukan input cepat jika perlu.
8. User melihat profil dan preferensi.

### Flow Data
- data dashboard diringkas dari beberapa modul
- data growth diurutkan sebagai time-series
- data nutrition bersifat harian dan bisa dibagi per meal slot
- data posyandu berisi jadwal akan datang dan riwayat selesai
- data imunisasi dipakai sebagai status tracking

### Flow Bisnis yang Harus Didukung Backend
- create, read, update, delete data anak
- catat pertumbuhan berkala
- catat konsumsi nutrisi dan hidrasi
- buat jadwal posyandu
- tandai jadwal selesai
- pantau imunisasi
- kirim notifikasi pengingat

---

# 3. BACKEND REQUIREMENTS

## Kebutuhan Backend Utama
- autentikasi user
- manajemen multi-child
- penyimpanan growth records
- penyimpanan nutrition journals
- penyimpanan jadwal posyandu
- penyimpanan status imunisasi
- dashboard summary endpoint
- notification system
- role-based access control

## Kebutuhan API
- REST API versioned
- standard response format
- pagination
- filtering
- sorting
- search
- idempotency untuk beberapa create action
- upload endpoint jika file dibutuhkan

## Kebutuhan Database
- tabel user
- tabel child
- tabel growth record
- tabel nutrition journal
- tabel nutrition meal item
- tabel hydration log
- tabel immunization definition
- tabel immunization record
- tabel posyandu schedule
- tabel notification
- tabel device token
- tabel audit log

## Kebutuhan Auth
- login
- register
- refresh token
- logout
- token rotation
- password reset
- email verification jika diperlukan
- role-based authorization

## Kebutuhan Storage
- penyimpanan gambar profil
- penyimpanan foto bukti atau lampiran jika nanti diperlukan
- penyimpanan file ekspor laporan
- object storage berbasis bucket

## Kebutuhan Realtime
- notifikasi pengingat jadwal
- update status jadwal secara near-real-time
- sinkronisasi badge notifikasi

## Kebutuhan Cache
- cache dashboard summary
- cache kurva referensi WHO
- cache daftar jadwal terbaru
- cache profil dan preference

## Kebutuhan Queue
- pengiriman notifikasi terjadwal
- generation laporan asinkron
- sinkronisasi data berat jika ada proses batch
- email delivery async

## Kebutuhan Monitoring
- request logging
- error tracking
- metrics endpoint
- health check
- audit trail perubahan data kesehatan

---

# 4. RECOMMENDED BACKEND ARCHITECTURE

## Rekomendasi Utama
Gunakan **Modular Monolith** dengan **Clean Architecture** dan struktur domain-driven ringan.

## Alasan Teknis
1. Scope aplikasi saat ini masih terpusat pada satu domain kesehatan anak, sehingga microservices akan terlalu mahal untuk kompleksitas awal.
2. Modul fitur sudah jelas dan bisa dipisah sebagai bounded context: auth, child profile, growth, nutrition, posyandu, notification.
3. Clean Architecture cocok dengan pola Flutter frontend yang juga sudah feature-first dan usecase-driven.
4. Modular monolith memudahkan deploy, observability, dan transaksi konsisten pada data medis anak.
5. Jika trafik meningkat, modul tertentu dapat dipisahkan menjadi service tersendiri tanpa merombak domain inti.

## Pola Arsitektur yang Disarankan
- Presentation layer: controller / route handler / websocket gateway
- Application layer: use case / service
- Domain layer: entity / policy / rule
- Infrastructure layer: repository impl / ORM / queue / cache / storage

## Batas Domain yang Disarankan
- Auth & Identity
- Child Profile
- Growth Tracking
- Nutrition Tracking
- Posyandu & Immunization
- Notification & Reminder
- Reporting & Analytics

---

# 5. RECOMMENDED TECH STACK

| Kategori | Teknologi | Alasan |
|---|---|---|
| Backend Framework | NestJS | Modular, TypeScript, cocok untuk clean architecture dan scalable monolith |
| Database | PostgreSQL | Relasional, kuat untuk data kesehatan dan konsistensi transaksi |
| ORM | Prisma | Schema-driven, cepat untuk pengembangan, migrasi mudah |
| Cache | Redis | Cache dashboard, token blacklist, rate limiting, queue support |
| Queue | BullMQ | Stabil untuk job async, reminder, report generation |
| Storage | S3 Compatible Object Storage | Mudah diskalakan untuk foto dan file laporan |
| Auth | JWT + Refresh Token | Flow mobile-friendly dan mendukung token rotation |
| Realtime | Socket.IO atau WebSocket native | Cocok untuk notifikasi live dan status update |
| Monitoring | Prometheus + Grafana | Metrics dan dashboard observability |
| Logging | Pino / Winston + centralized logs | Structured log untuk debugging produksi |
| Deployment | Docker + Kubernetes atau VPS Docker Compose | Fleksibel untuk tahap awal dan scale-up |
| CI/CD | GitHub Actions | Otomasi test, build, lint, dan deploy |

Catatan: bila tim lebih nyaman dengan Laravel / Go / Spring Boot, struktur konsepnya tetap sama. Yang penting adalah pemisahan domain dan contract API, bukan nama framework semata.

---

# 6. COMPLETE BACKEND FOLDER STRUCTURE

```txt
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── children/
│   │   ├── growth/
│   │   ├── nutrition/
│   │   ├── posyandu/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── files/
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── constants/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── cache/
│   ├── queue/
│   ├── storage/
│   ├── websocket/
│   ├── jobs/
│   ├── events/
│   ├── utils/
│   └── main.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── api/
│   ├── db/
│   └── architecture/
├── docker/
├── scripts/
├── .github/
│   └── workflows/
└── .env.example
```

## Fungsi Tiap Folder
- `modules/`: setiap domain bisnis dipisah sebagai modul independen
- `common/`: helper lintas modul seperti guard, decorator, filter, dan interceptor
- `config/`: konfigurasi aplikasi, env, dan service pihak ketiga
- `database/`: migration, seed, dan factory
- `cache/`: abstraksi Redis
- `queue/`: job async dan worker
- `storage/`: integrasi object storage
- `websocket/`: gateway realtime
- `jobs/`: proses latar belakang
- `events/`: event domain dan event broadcaster
- `utils/`: utilitas umum
- `tests/`: pengujian berlapis
- `docs/`: dokumentasi teknis
- `docker/`: Dockerfile dan compose
- `scripts/`: helper untuk devops dan maintenance

---

# 7. DATABASE DESIGN

## ERD Description
Entitas utama yang disarankan:
- `users`
- `children`
- `growth_records`
- `nutrition_journals`
- `nutrition_meals`
- `hydration_logs`
- `immunization_definitions`
- `immunization_records`
- `posyandu_schedules`
- `notification_tokens`
- `notifications`
- `audit_logs`

## Relational Mapping
- satu `user` bisa memiliki banyak `children`
- satu `child` punya banyak `growth_records`
- satu `child` punya banyak `nutrition_journals`
- satu `nutrition_journal` punya banyak `nutrition_meals`
- satu `child` punya banyak `hydration_logs`
- satu `child` punya banyak `immunization_records`
- satu `child` punya banyak `posyandu_schedules`
- satu `user` bisa punya banyak `notification_tokens`
- satu `user` menerima banyak `notifications`
- semua perubahan penting dicatat di `audit_logs`

## Normalization
Desain di bawah mengikuti minimal normal form ke-3:
- data user dipisahkan dari data anak
- growth record tidak dicampur dengan jurnal nutrisi
- meal detail dipisah dari jurnal harian
- definisi imunisasi dipisah dari record imunisasi anak
- jadwal posyandu dipisah dari notifikasi

## Indexing Strategy
- index pada `users.email`
- index pada `children.user_id`
- index gabungan pada `growth_records.child_id, measured_at`
- index gabungan pada `nutrition_journals.child_id, journal_date`
- index gabungan pada `posyandu_schedules.child_id, scheduled_at`
- index pada `immunization_records.child_id, immunization_definition_id`
- index pada `notifications.user_id, status`
- index pada `audit_logs.actor_user_id, created_at`

## Constraints
- unique `users.email`
- unique `users.phone_number` jika digunakan
- foreign key semua relasi child ke parent
- check constraint untuk nilai status enum
- not null pada field inti
- cascade delete harus hati-hati untuk data medis; biasanya soft delete lebih aman

## Tabel: users

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| full_name | VARCHAR(150) | No | Nama lengkap |
| email | VARCHAR(150) | Yes | Email login |
| phone_number | VARCHAR(30) | Yes | Nomor telepon |
| password_hash | TEXT | Yes | Hash password untuk login lokal |
| role | ENUM(user, admin, health_worker, superadmin) | No | Role akses |
| status | ENUM(active, inactive, suspended) | No | Status akun |
| email_verified_at | TIMESTAMP | Yes | Waktu verifikasi email |
| last_login_at | TIMESTAMP | Yes | Login terakhir |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |
| deleted_at | TIMESTAMP | Yes | Soft delete |

Primary key: `id`
Foreign key: tidak ada
Indexing: `email`, `phone_number`, `role`, `status`
Relation: one-to-many ke `children`, `notification_tokens`, `notifications`, `audit_logs`

## Tabel: children

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| user_id | UUID | No | Pemilik data anak |
| full_name | VARCHAR(150) | No | Nama anak |
| gender | ENUM(male, female) | No | Jenis kelamin |
| date_of_birth | DATE | No | Tanggal lahir |
| place_of_birth | VARCHAR(150) | Yes | Tempat lahir |
| blood_type | VARCHAR(5) | Yes | Golongan darah |
| photo_url | TEXT | Yes | Foto anak |
| notes | TEXT | Yes | Catatan profil anak |
| status | ENUM(active, inactive) | No | Status profil anak |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |
| deleted_at | TIMESTAMP | Yes | Soft delete |

Primary key: `id`
Foreign key: `user_id -> users.id`
Indexing: `user_id`, `date_of_birth`, `status`
Relation: one-to-many ke growth, nutrition, hydration, immunization, posyandu

## Tabel: growth_records

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| child_id | UUID | No | Anak terkait |
| measured_at | DATE | No | Tanggal pengukuran |
| weight_kg | DECIMAL(5,2) | No | Berat badan |
| height_cm | DECIMAL(5,2) | No | Tinggi badan |
| head_circumference_cm | DECIMAL(5,2) | Yes | Lingkar kepala |
| z_score_weight | DECIMAL(6,2) | Yes | Z-score berat |
| z_score_height | DECIMAL(6,2) | Yes | Z-score tinggi |
| z_score_bmi | DECIMAL(6,2) | Yes | Z-score BMI |
| recorded_by_user_id | UUID | Yes | Petugas / user pencatat |
| source | ENUM(manual, import, sync) | No | Sumber data |
| notes | TEXT | Yes | Catatan |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |

Primary key: `id`
Foreign key: `child_id -> children.id`, `recorded_by_user_id -> users.id`
Indexing: `child_id, measured_at`, `child_id, source`
Relation: many records per child

## Tabel: nutrition_journals

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| child_id | UUID | No | Anak terkait |
| journal_date | DATE | No | Tanggal jurnal |
| total_calories | INT | Yes | Total kalori harian |
| total_protein_g | DECIMAL(6,2) | Yes | Total protein |
| total_carb_g | DECIMAL(6,2) | Yes | Total karbohidrat |
| total_fat_g | DECIMAL(6,2) | Yes | Total lemak |
| total_water_ml | INT | Yes | Total air |
| status | ENUM(draft, submitted, approved) | No | Status jurnal |
| notes | TEXT | Yes | Catatan |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |

Primary key: `id`
Foreign key: `child_id -> children.id`
Indexing: `child_id, journal_date`, `status`
Relation: one-to-many ke `nutrition_meals`

## Tabel: nutrition_meals

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| nutrition_journal_id | UUID | No | Jurnal harian |
| meal_type | ENUM(breakfast, lunch, dinner, snack, hydration) | No | Jenis konsumsi |
| title | VARCHAR(200) | No | Nama menu |
| subtitle | VARCHAR(200) | Yes | Deskripsi singkat |
| calories | INT | Yes | Kalori per menu |
| portion | VARCHAR(100) | Yes | Porsi |
| status_label | VARCHAR(50) | Yes | Contoh: habis, sisa sedikit |
| status_color | VARCHAR(30) | Yes | Untuk UI jika diperlukan |
| consumed_at | TIMESTAMP | Yes | Waktu konsumsi |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |

Primary key: `id`
Foreign key: `nutrition_journal_id -> nutrition_journals.id`
Indexing: `nutrition_journal_id, meal_type`
Relation: many meals per journal

## Tabel: hydration_logs

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| child_id | UUID | No | Anak terkait |
| log_date | DATE | No | Tanggal hidrasi |
| cups_target | INT | No | Target gelas |
| cups_consumed | INT | No | Gelas yang terpenuhi |
| unit | VARCHAR(20) | No | Misal: gelas, ml |
| notes | TEXT | Yes | Catatan |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |

Primary key: `id`
Foreign key: `child_id -> children.id`
Indexing: `child_id, log_date`

## Tabel: immunization_definitions

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| code | VARCHAR(50) | No | Kode imunisasi |
| name | VARCHAR(150) | No | Nama imunisasi |
| schedule_age_months | INT | Yes | Usia anjuran bulan |
| description | TEXT | Yes | Deskripsi |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |

Primary key: `id`
Foreign key: tidak ada
Indexing: `code`, `name`
Relation: referenced by `immunization_records`

## Tabel: immunization_records

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| child_id | UUID | No | Anak terkait |
| immunization_definition_id | UUID | No | Jenis imunisasi |
| given_at | DATE | Yes | Tanggal diberikan |
| status | ENUM(done, pending, skipped) | No | Status imunisasi |
| facility_name | VARCHAR(150) | Yes | Fasilitas pelayanan |
| batch_number | VARCHAR(100) | Yes | Nomor batch vaksin |
| note | TEXT | Yes | Catatan |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |

Primary key: `id`
Foreign key: `child_id -> children.id`, `immunization_definition_id -> immunization_definitions.id`
Indexing: `child_id`, `immunization_definition_id`, `status`

## Tabel: posyandu_schedules

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| child_id | UUID | No | Anak terkait |
| title | VARCHAR(200) | No | Judul jadwal |
| category | VARCHAR(100) | No | Kategori: posyandu, vitamin, imunisasi |
| location | VARCHAR(200) | No | Lokasi |
| scheduled_at | TIMESTAMP | No | Waktu jadwal |
| note | TEXT | Yes | Catatan |
| is_completed | BOOLEAN | No | Status selesai |
| completed_at | TIMESTAMP | Yes | Waktu selesai |
| created_by_user_id | UUID | Yes | Pembuat jadwal |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |

Primary key: `id`
Foreign key: `child_id -> children.id`, `created_by_user_id -> users.id`
Indexing: `child_id, scheduled_at`, `is_completed`, `category`
Relation: one child many schedules

## Tabel: notification_tokens

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| user_id | UUID | No | Pemilik token |
| device_id | VARCHAR(150) | No | ID perangkat |
| platform | ENUM(android, ios, web) | No | Platform device |
| token | TEXT | No | Push token |
| is_active | BOOLEAN | No | Status aktif |
| last_seen_at | TIMESTAMP | Yes | Last seen |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |

Primary key: `id`
Foreign key: `user_id -> users.id`
Indexing: `user_id`, `device_id`, `is_active`

## Tabel: notifications

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| user_id | UUID | No | Penerima |
| child_id | UUID | Yes | Anak terkait jika ada |
| type | VARCHAR(50) | No | Tipe notifikasi |
| title | VARCHAR(200) | No | Judul |
| body | TEXT | No | Isi pesan |
| data | JSONB | Yes | Payload tambahan |
| status | ENUM(unread, read, archived) | No | Status baca |
| sent_at | TIMESTAMP | Yes | Waktu dikirim |
| read_at | TIMESTAMP | Yes | Waktu dibaca |
| created_at | TIMESTAMP | No | Created timestamp |
| updated_at | TIMESTAMP | No | Updated timestamp |

Primary key: `id`
Foreign key: `user_id -> users.id`, `child_id -> children.id`
Indexing: `user_id, status`, `type`, `created_at`

## Tabel: audit_logs

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Primary key |
| actor_user_id | UUID | Yes | Pelaku aksi |
| entity_type | VARCHAR(100) | No | Nama entitas |
| entity_id | UUID | No | ID entitas |
| action | VARCHAR(50) | No | create/update/delete/login |
| before_data | JSONB | Yes | Snapshot sebelum perubahan |
| after_data | JSONB | Yes | Snapshot sesudah perubahan |
| ip_address | VARCHAR(50) | Yes | IP asal |
| user_agent | TEXT | Yes | User agent |
| created_at | TIMESTAMP | No | Created timestamp |

Primary key: `id`
Foreign key: `actor_user_id -> users.id`
Indexing: `actor_user_id, created_at`, `entity_type, entity_id`

---

# 8. API DESIGN

## Standard Response Format
Semua endpoint sebaiknya memakai format konsisten:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": {}
}
```

Untuk error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## AUTH MODULE

### POST /api/v1/auth/register
Request:
```json
{
  "fullName": "Budi Santoso",
  "email": "user@gmail.com",
  "password": "password123",
  "phoneNumber": "081234567890"
}
```
Response:
```json
{
  "success": true,
  "message": "Registration success",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Budi Santoso",
      "email": "user@gmail.com",
      "role": "user"
    },
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```
Error:
```json
{
  "success": false,
  "message": "Email already exists"
}
```
Auth: No
Validation: email format, password strength, unique email

### POST /api/v1/auth/login
Request:
```json
{
  "email": "user@gmail.com",
  "password": "password123"
}
```
Response:
```json
{
  "success": true,
  "message": "Login success",
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "fullName": "Budi Santoso",
      "role": "user"
    }
  }
}
```
Error:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```
Auth: No

### POST /api/v1/auth/refresh
Request:
```json
{
  "refreshToken": "jwt"
}
```
Response:
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```
Auth: Refresh token only

### POST /api/v1/auth/logout
Request:
```json
{
  "refreshToken": "jwt"
}
```
Response:
```json
{
  "success": true,
  "message": "Logout success"
}
```
Auth: Yes

### GET /api/v1/auth/me
Response:
```json
{
  "success": true,
  "message": "Profile loaded",
  "data": {
    "id": "uuid",
    "fullName": "Budi Santoso",
    "email": "user@gmail.com",
    "role": "user"
  }
}
```
Auth: Yes

## DASHBOARD MODULE

### GET /api/v1/dashboard/overview?childId=uuid
Response:
```json
{
  "success": true,
  "message": "Dashboard overview loaded",
  "data": {
    "child": {
      "id": "uuid",
      "fullName": "Alya",
      "ageMonths": 18,
      "gender": "female"
    },
    "growthSummary": {
      "lastWeightKg": 10.4,
      "lastHeightCm": 82.5,
      "zScore": -0.3,
      "status": "normal"
    },
    "nutritionSummary": {
      "todayCalories": 520,
      "waterConsumedMl": 800,
      "waterTargetMl": 1000
    },
    "nextSchedule": {
      "id": "uuid",
      "title": "Posyandu & Vitamin A",
      "scheduledAt": "2026-05-15T08:00:00Z"
    },
    "tips": [
      {
        "id": "uuid",
        "title": "Perbanyak protein hewani",
        "description": "Tambahkan telur atau ikan pada menu harian."
      }
    ]
  }
}
```
Auth: Yes

## CHILD MODULE

### GET /api/v1/children
Query: `page`, `limit`, `search`, `sortBy`, `sortOrder`
Response:
```json
{
  "success": true,
  "message": "Children loaded",
  "data": [
    {
      "id": "uuid",
      "fullName": "Alya",
      "dateOfBirth": "2024-01-12",
      "gender": "female"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```
Auth: Yes

### POST /api/v1/children
Request:
```json
{
  "fullName": "Alya",
  "gender": "female",
  "dateOfBirth": "2024-01-12",
  "placeOfBirth": "Jakarta"
}
```
Auth: Yes

### GET /api/v1/children/:id
Auth: Yes

### PATCH /api/v1/children/:id
Auth: Yes

### DELETE /api/v1/children/:id
Auth: Yes, soft delete

## GROWTH MODULE

### GET /api/v1/children/:childId/growth-records
Query: `page`, `limit`, `from`, `to`, `metric`, `sortOrder`
Response:
```json
{
  "success": true,
  "message": "Growth records loaded",
  "data": [
    {
      "id": "uuid",
      "measuredAt": "2026-05-01",
      "weightKg": 10.4,
      "heightCm": 82.5,
      "zScoreWeight": -0.3,
      "zScoreHeight": 0.1
    }
  ]
}
```
Auth: Yes

### POST /api/v1/children/:childId/growth-records
Request:
```json
{
  "measuredAt": "2026-05-01",
  "weightKg": 10.4,
  "heightCm": 82.5,
  "headCircumferenceCm": 46.2,
  "notes": "Pengukuran rutin posyandu"
}
```
Auth: Yes
Validation: weight and height must be positive

### GET /api/v1/children/:childId/growth-chart
Auth: Yes

### GET /api/v1/who-reference?gender=female&ageMonths=18&metric=weight
Auth: Yes

## NUTRITION MODULE

### GET /api/v1/children/:childId/nutrition-journals
Query: `page`, `limit`, `date`, `status`
Auth: Yes

### POST /api/v1/children/:childId/nutrition-journals
Request:
```json
{
  "journalDate": "2026-05-08",
  "notes": "Makan lebih lahap"
}
```
Auth: Yes

### POST /api/v1/nutrition-journals/:journalId/meals
Request:
```json
{
  "mealType": "breakfast",
  "title": "Bubur hati ayam + bayam",
  "subtitle": "Protein hewani, zat besi",
  "calories": 150,
  "portion": "1 mangkuk kecil",
  "statusLabel": "Habis"
}
```
Auth: Yes

### PATCH /api/v1/nutrition-meals/:mealId
Auth: Yes

### DELETE /api/v1/nutrition-meals/:mealId
Auth: Yes

### GET /api/v1/children/:childId/hydration-logs/today
Auth: Yes

### POST /api/v1/children/:childId/hydration-logs
Request:
```json
{
  "logDate": "2026-05-08",
  "cupsTarget": 6,
  "cupsConsumed": 4,
  "unit": "cups"
}
```
Auth: Yes

## POSYANDU MODULE

### GET /api/v1/posyandu/overview?childId=uuid
Response:
```json
{
  "success": true,
  "message": "Posyandu overview loaded",
  "data": {
    "immunizations": [
      { "name": "BCG", "is_done": true },
      { "name": "Campak", "is_done": false }
    ],
    "upcoming_schedules": [
      {
        "id": "upcoming-1",
        "title": "Posyandu & Vitamin A",
        "category": "Vitamin",
        "location": "Puskesmas Garuda",
        "scheduled_at": "2026-05-14T08:00:00Z",
        "note": "Bawa Buku KIA",
        "is_completed": false
      }
    ],
    "completed_schedules": [
      {
        "id": "history-1",
        "title": "Imunisasi DPT 3",
        "category": "Imunisasi",
        "location": "Puskesmas Garuda",
        "scheduled_at": "2026-04-08T08:00:00Z",
        "is_completed": true
      }
    ]
  }
}
```
Auth: Yes

### POST /api/v1/children/:childId/posyandu-schedules
Request:
```json
{
  "title": "Jadwal Posyandu Baru",
  "category": "Posyandu",
  "location": "Posyandu Mawar",
  "scheduledAt": "2026-05-20T08:00:00Z",
  "note": "Bawa buku KIA"
}
```
Auth: Yes

### PATCH /api/v1/posyandu-schedules/:id/complete
Request:
```json
{
  "completedAt": "2026-05-20T09:30:00Z"
}
```
Auth: Yes

### POST /api/v1/children/:childId/immunization-records
Auth: Yes

### GET /api/v1/children/:childId/immunization-records
Auth: Yes

## NOTIFICATION MODULE

### GET /api/v1/notifications
Query: `page`, `limit`, `status`
Auth: Yes

### PATCH /api/v1/notifications/:id/read
Auth: Yes

### POST /api/v1/device-tokens
Auth: Yes

## FILE MODULE

### POST /api/v1/files/upload
Auth: Yes
Content-Type: multipart/form-data

### GET /api/v1/files/presign
Auth: Yes

## ERROR FORMAT

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "weightKg",
      "message": "Weight must be greater than 0"
    }
  ]
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 9. AUTHENTICATION & AUTHORIZATION

## JWT Flow
1. User login dengan email/password.
2. Server mengeluarkan `accessToken` berumur pendek.
3. Server mengeluarkan `refreshToken` berumur lebih panjang.
4. Access token dipakai di header `Authorization: Bearer <token>`.
5. Saat access token expired, client memakai refresh token untuk memperoleh token baru.
6. Refresh token lama diganti bila token rotation diaktifkan.

## Access Token
- short-lived, misalnya 15 menit
- dipakai untuk request harian
- disimpan secara aman di secure storage pada mobile

## Refresh Token
- long-lived, misalnya 7-30 hari
- harus bisa di-revoke
- sebaiknya disimpan hashed di database

## RBAC
Role yang disarankan:
- `user`: orang tua atau wali
- `health_worker`: petugas posyandu
- `admin`: operator sistem
- `superadmin`: manajemen platform

## Middleware
- auth guard
- role guard
- permission guard
- rate limit guard
- optional child ownership guard

## OAuth
Belum terlihat di source code, tetapi bisa ditambahkan di fase berikutnya:
- Google sign-in
- Apple sign-in

## Session Handling
- login mencatat device info
- token disimpan per device
- logout menonaktifkan refresh token tertentu
- logout all devices bila diperlukan

## Token Rotation
- refresh token selalu diganti saat dipakai
- token lama diblacklist atau dihapus dari storage
- mengurangi risiko token replay

## Revocation
- logout
- password change
- account suspension
- device deactivation

## Rate Limiting
- login: sangat ketat
- refresh token: sedang
- create data kesehatan: ketat per user/device
- public endpoint: tetap dibatasi

---

# 10. SECURITY DESIGN

## Password Hashing
Gunakan:
- Argon2id jika stack mendukung
- atau bcrypt cost tinggi sebagai alternatif aman

## CORS
- whitelist origin yang jelas
- jangan pakai wildcard untuk endpoint sensitif

## CSRF
- relevan jika backend menyediakan cookie-based auth
- jika mobile murni menggunakan bearer token, risiko lebih kecil

## Helmet
Aktifkan security headers:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`

## SQL Injection
- gunakan parameterized query / ORM aman
- validasi input semua request

## XSS
- sanitize field teks jika tampil di web panel
- escape output pada admin dashboard

## Request Validation
- schema validation untuk setiap DTO
- enum validation
- date validation
- numeric range validation

## API Throttling
- login dan OTP harus diberi throttling
- endpoint write data kesehatan juga perlu limit

## Brute Force Protection
- temporary lock setelah gagal login berulang
- device and IP heuristic

## Secret Management
- simpan secret di env dan secret manager
- jangan hardcode JWT secret, DB url, atau API key

---

# 11. FILE STORAGE DESIGN

## Upload Strategy
- gunakan direct upload ke object storage bila file besar
- gunakan signed URL untuk upload aman
- backend hanya mengeluarkan presigned URL atau memvalidasi file multipart

## Image Optimization
- resize image server-side
- generate thumbnail
- compress sebelum simpan

## CDN
- gunakan CDN untuk file statis dan foto profil agar loading cepat

## Bucket Structure
```txt
children/{childId}/profile/{fileName}
children/{childId}/growth/{fileName}
children/{childId}/nutrition/{fileName}
reports/{reportId}/{fileName}
```

## Naming Convention
- gunakan UUID atau hash
- hindari nama asli file sebagai identitas utama
- simpan original filename sebagai metadata

## Signed URL
- berlaku singkat
- akses langsung ke object storage
- cocok untuk upload report atau foto

## Storage Lifecycle
- file lama yang tidak dipakai bisa dipindah ke cold storage
- thumbnail tetap dipertahankan

---

# 12. REALTIME ARCHITECTURE

Aplikasi ini belum menunjukkan live chat, tetapi realtime tetap berguna untuk notifikasi dan update status.

## Kebutuhan Realtime yang Disarankan
- notifikasi reminder jadwal
- update jumlah jadwal selesai
- badge unread notification
- sinkronisasi event dari petugas posyandu

## Websocket Architecture
- namespace `/notifications`
- namespace `/sync`
- room per user
- optional room per child

## Socket Namespace
- `/notifications`: push reminder dan event notifikasi
- `/health-events`: update status penting terkait growth atau immunization

## Room Management
- room user id
- room device id
- room child id jika multi-child view diperlukan

## Push Notification
- gunakan FCM untuk mobile push
- backend mengelola pengiriman dan retry

## Event Broadcasting
Contoh event:
- `notification.created`
- `posyandu.schedule.created`
- `posyandu.schedule.completed`
- `growth.record.created`

---

# 13. SCALABILITY PLAN

## Redis Caching
Cache untuk:
- dashboard overview
- WHO reference data
- latest posyandu overview
- child profile summary

## Queue Worker
Gunakan worker untuk:
- reminder notifikasi
- report export
- email delivery
- media processing

## Horizontal Scaling
- backend stateless
- session disimpan di Redis / DB
- file disimpan di object storage
- load balancer di depan app server

## DB Replication
- primary untuk write
- replica untuk read-heavy reporting

## Sharding
Belum diperlukan di tahap awal. Pertimbangkan hanya jika jumlah user dan catatan medis sangat besar.

## Pagination
Semua list besar harus memakai pagination server-side.

## Indexing
Index wajib untuk:
- user ownership
- child relation
- scheduled dates
- status fields

## Lazy Loading
- endpoint chart ambil data per range tanggal
- jangan kirim seluruh history jika tidak perlu

---

# 14. ENVIRONMENT VARIABLES

```env
APP_NAME=NalarGizi
PORT=3000
NODE_ENV=production

DATABASE_URL=postgresql://user:password@localhost:5432/nalargizi
REDIS_URL=redis://localhost:6379

JWT_SECRET=change_this_access_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=https://app.nalargizi.dev

S3_REGION=ap-southeast-1
S3_BUCKET=nalar-gizi-storage
S3_ACCESS_KEY=change_me
S3_SECRET_KEY=change_me
S3_PUBLIC_URL=https://cdn.nalargizi.dev

FCM_PROJECT_ID=change_me
FCM_CLIENT_EMAIL=change_me
FCM_PRIVATE_KEY=change_me

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=change_me
MAIL_PASSWORD=change_me
MAIL_FROM=no-reply@nalargizi.dev

LOG_LEVEL=info
SENTRY_DSN=
```

---

# 15. DEVOPS & DEPLOYMENT

## Docker
- buat `Dockerfile` untuk backend
- gunakan multi-stage build
- simpan image kecil dan reproducible

## docker-compose
Untuk development lokal:
- backend
- postgres
- redis
- object storage mock jika perlu

## CI/CD
Pipeline yang disarankan:
1. install dependencies
2. lint
3. unit test
4. integration test
5. build image
6. push registry
7. deploy

## GitHub Actions
Workflow minimal:
- pull request checks
- main branch deployment
- database migration step

## Railway / VPS / AWS / GCP
- Railway cocok untuk bootstrap cepat
- VPS cocok untuk kontrol cost
- AWS/GCP cocok untuk production skala besar

## Monitoring
- metrics Prometheus
- logs terstruktur
- alert jika error rate naik

## Backup Strategy
- backup database harian
- backup terjadwal untuk storage metadata
- test restore berkala

---

# 16. TESTING STRATEGY

## Unit Testing
- domain rule
- validation helper
- service logic
- token generation

## Integration Testing
- repository ke database
- controller ke service
- auth flow
- notification queue

## E2E Testing
- register
- login
- create child
- input growth
- input nutrition
- create posyandu schedule
- mark complete

## API Testing
- koleksi Postman / Insomnia
- snapshot response contract

## Load Testing
- login endpoint
- dashboard summary
- chart endpoint
- list schedule endpoint

---

# 17. PERFORMANCE OPTIMIZATION

## Caching
- cache response yang sering dipakai
- invalidasi cache setelah write

## Query Optimization
- pilih index yang tepat
- hindari N+1 query
- gunakan eager loading selektif

## Lazy Loading
- pagination untuk history panjang
- filter berdasarkan tanggal

## Compression
- aktifkan gzip atau brotli pada response JSON

## Image Optimization
- resize dan kompres image sebelum upload

## Pagination
- gunakan cursor pagination jika data history sangat besar
- gunakan page-based pagination untuk layar sederhana

---

# 18. DEVELOPMENT ROADMAP

## Phase 1
- setup backend project
- setup database schema
- setup migration
- setup config & env
- setup health check

## Phase 2
- auth system
- JWT access/refresh token
- RBAC
- refresh token rotation

## Phase 3
- child profile module
- dashboard overview module
- growth module

## Phase 4
- nutrition module
- hydration module
- posyandu module
- immunization tracking

## Phase 5
- notification system
- websocket / push notification
- queue worker

## Phase 6
- file storage
- analytics
- audit log
- admin panel API

## Phase 7
- performance hardening
- monitoring
- load testing
- backup automation

---

# 19. AI AGENT IMPLEMENTATION GUIDE

Bagian ini ditulis agar AI Agent bisa membangun backend secara otomatis tanpa harus menebak dependency antar modul.

## Urutan Implementasi yang Disarankan
1. Buat project skeleton backend.
2. Buat konfigurasi environment.
3. Buat koneksi database dan migration.
4. Buat auth module.
5. Buat user dan child module.
6. Buat growth module.
7. Buat nutrition module.
8. Buat posyandu module.
9. Buat notification module.
10. Buat file module.
11. Tambahkan cache, queue, dan monitoring.
12. Tambahkan test dan deploy automation.

## Dependency Antar Module
- `auth` bergantung pada `users`
- `children` bergantung pada `users`
- `growth` bergantung pada `children`
- `nutrition` bergantung pada `children`
- `posyandu` bergantung pada `children` dan `immunization`
- `notifications` bergantung pada semua domain event
- `files` berdiri sendiri tetapi dipakai oleh `users` dan `children`
- `analytics` membaca dari semua domain utama

## Contract yang Harus Dijaga AI Agent
- setiap endpoint memakai versioning `/api/v1`
- setiap response harus konsisten
- field tanggal dikirim ISO-8601
- field boolean jangan ambigu
- gunakan snake_case atau camelCase secara konsisten; jika sudah memakai snake_case pada mobile, pertahankan di payload dari backend bila frontend belum berubah
- jangan mengembalikan HTML untuk error API

## Output Minimal yang Harus Dihasilkan AI Agent
- source code backend
- migration database
- seed data
- OpenAPI/Swagger docs
- test suite
- Dockerfile
- docker-compose
- `.env.example`
- README teknis

## Strategi Implementasi Bertahap untuk AI Agent
### Langkah 1: Foundation
- setup lint, formatter, config env, logger, error handler

### Langkah 2: Auth
- register, login, refresh, logout, me

### Langkah 3: Core Health Domain
- users, children, growth, nutrition, posyandu

### Langkah 4: Operational Layer
- notifications, queue, cache, audit log

### Langkah 5: Production Readiness
- test, observability, rate limit, backups, deployment

---

# 20. FINAL CONCLUSION

NalarGizi terlihat sebagai aplikasi monitoring tumbuh kembang anak yang sudah disusun dengan struktur feature-first dan clean-architecture style di Flutter. Backend yang paling tepat adalah modular monolith dengan domain jelas, karena aplikasi memerlukan konsistensi data kesehatan, relasi antar entitas yang kuat, dan skalabilitas bertahap tanpa overhead microservices terlalu dini.

Desain yang direkomendasikan menekankan:
- keamanan autentikasi dan token
- model database relasional yang rapi
- endpoint REST versioned yang konsisten
- caching dan queue untuk beban operasional
- storage terpisah untuk file
- observability agar siap produksi

Secara keseluruhan, spesifikasi ini sudah cukup untuk dipakai sebagai blueprint pembangunan backend production-ready dan juga sebagai input AI Agent untuk menghasilkan implementasi backend secara otomatis.
