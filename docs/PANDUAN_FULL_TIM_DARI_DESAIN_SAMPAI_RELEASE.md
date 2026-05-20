# Panduan Full Tim: Dari Desain UI/UX Sampai API dan Release

Dokumen ini adalah SOP kerja tim untuk membangun aplikasi NalarGizi dari tahap desain sampai aplikasi siap rilis.

Target dokumen ini:
1. Semua anggota tim punya urutan kerja yang sama.
2. Tidak ada kebingungan kapan fokus UI, kapan fokus state, kapan fokus API.
3. Hasil development konsisten dan mudah direview.

## 1. Scope dan Target Akhir

Scope MVP NalarGizi:
- Dashboard
- Growth (kurva tumbuh kembang)
- Nutrition (jurnal nutrisi)
- Posyandu (jadwal dan imunisasi)
- Quick Add (entry tambah data)
- Auth dan Profile dasar

Target selesai development:
- UI sesuai desain yang disepakati
- Routing stabil
- State management berjalan
- API terintegrasi
- Testing minimum lulus
- Siap build release

## 2. Struktur Tim dan Peran

Peran minimum:
1. Product Owner
- Menentukan prioritas fitur dan acceptance criteria.

2. UI/UX Designer
- Menyediakan wireframe, high fidelity, design system, dan prototype flow.

3. Flutter Developer
- Implement UI, routing, state, domain, data, API, dan test.

4. QA/Tester
- Menjalankan test plan manual dan regression.

5. Tech Lead (opsional)
- Menjaga arsitektur, review kualitas code, dan keputusan teknis lintas fitur.

## 3. Alur Kerja Utama (Phase by Phase)

## Phase 0 - Kickoff dan Requirement

Output phase:
- Daftar fitur MVP
- User flow utama
- Prioritas sprint
- Definisi selesai per fitur

Checklist:
- [ ] Semua fitur inti disepakati
- [ ] Acceptance criteria tiap fitur sudah ditulis
- [ ] Risiko awal sudah dicatat

## Phase 1 - Desain UI/UX (Wajib Sebelum Koding Besar)

Langkah:
1. Buat user flow utama:
- Beranda -> Growth -> Nutrition -> Posyandu -> Quick Add

2. Buat wireframe untuk semua halaman.
3. Buat high fidelity design.
4. Buat design system:
- warna
- typography
- spacing scale
- radius
- komponen reusable

5. Buat prototype interaksi utama.
6. Lakukan design review bersama tim dev.

Output phase:
- File desain final
- Design token dasar
- Komponen UI terdefinisi

Checklist:
- [ ] Semua halaman MVP punya desain final
- [ ] Semua state UI ada (empty/loading/error/success)
- [ ] Naming komponen konsisten

## Phase 2 - Technical Planning dan Breakdown Task

Langkah:
1. Mapping desain ke struktur folder Flutter.
2. Pecah task per fitur dan per layer:
- presentation
- domain
- data

3. Tentukan urutan implementasi:
- UI dulu
- routing
- state
- API
- testing

4. Tulis task board (Kanban/Sprint board).

Output phase:
- Backlog siap dikerjakan per sprint
- Estimasi effort

Checklist:
- [ ] Tiap task punya owner
- [ ] Tiap task punya acceptance criteria
- [ ] Dependency antar task jelas

## Phase 3 - Setup Dasar Project dan Standar Tim

Langkah:
1. Sinkron dependency (`flutter pub get`).
2. Validasi struktur folder sesuai arsitektur.
3. Tetapkan coding convention:
- naming file `snake_case`
- class `PascalCase`
- max tanggung jawab file

4. Tetapkan branch strategy.
5. Tetapkan PR checklist.

Output phase:
- Repo siap dipakai kolaborasi
- Aturan kerja tim jelas

Checklist:
- [ ] Branch strategy disepakati
- [ ] PR template disepakati
- [ ] Lint dan format dipakai konsisten

## Phase 4 - Implementasi UI (Tanpa API Dulu)

Urutan implementasi UI:
1. Dashboard
2. Growth
3. Nutrition
4. Posyandu
5. Quick Add
6. Profile/Auth screen dasar

Aturan implementasi UI:
- Data hardcoded sementara
- Komponen reusable dipisah ke widgets
- Tidak ada logic API di page
- Gunakan theme global

Output phase:
- Semua layar utama tampil sesuai desain

Checklist:
- [ ] UI semua fitur utama selesai
- [ ] Tidak ada overflow pada device umum
- [ ] Komponen reusable sudah dipisah

## Phase 5 - Routing dan Navigasi

Langkah:
1. Finalisasi route di `lib/app/router/app_router.dart`.
2. Hubungkan bottom navigation + FAB.
3. Pastikan transisi page dan back stack benar.

Output phase:
- Semua halaman dapat diakses melalui navigasi utama

Checklist:
- [ ] Route semua fitur aktif
- [ ] FAB membuka quick add
- [ ] Back navigation konsisten

## Phase 6 - State Management

Langkah per fitur:
1. Rapikan `*_state.dart`.
2. Rapikan `*_cubit.dart`.
3. Sambungkan page dengan `BlocProvider`/`BlocBuilder`/`BlocListener`.

State minimum:
- initial
- loading
- success
- failure

Output phase:
- UI menampilkan state dinamis

Checklist:
- [ ] Loading state tampil
- [ ] Error state tampil
- [ ] Success state memuat data dari state

## Phase 7 - Domain dan Data Layer

Langkah per fitur:
1. Domain:
- `entity`
- `repository contract`
- `usecase`

2. Data:
- `model`
- `remote datasource`
- `repository impl`

Output phase:
- Arsitektur clean layer berjalan

Checklist:
- [ ] Cubit memanggil usecase
- [ ] Usecase memanggil repository contract
- [ ] Repository impl memanggil datasource

## Phase 8 - Integrasi API

Langkah:
1. Setup `Dio` dan network config di `lib/core/network`.
2. Implement endpoint per fitur di datasource.
3. Parse response ke model.
4. Mapping model ke entity.
5. Mapping error ke pesan yang aman untuk UI.

Output phase:
- Data real dari backend tampil di aplikasi

Checklist:
- [ ] Semua endpoint MVP terhubung
- [ ] Error network tertangani
- [ ] Tidak ada crash saat API gagal

## Phase 9 - Testing dan QA

Jenis testing minimal:
1. Unit test (usecase/repository)
2. Widget test (screen utama)
3. Integration test (flow utama)
4. Manual QA checklist sesuai acceptance criteria

Perintah dasar:
```bash
flutter test
flutter test integration_test
```

Output phase:
- Fitur tervalidasi secara teknis dan fungsional

Checklist:
- [ ] Test minimum lulus
- [ ] Bug kritis ditutup
- [ ] Regression check selesai

## Phase 10 - UAT, Release Candidate, dan Rilis

Langkah:
1. UAT internal/PO.
2. Perbaikan bug akhir.
3. Freeze scope.
4. Build release.

Build command contoh:
```bash
flutter build apk --release
flutter build appbundle --release
```

Checklist:
- [ ] Versi app di `pubspec.yaml` sudah benar
- [ ] Release note siap
- [ ] Artifact build valid

## 4. Branch Strategy (Disarankan)

Gunakan pola sederhana:
- `main`: branch stabil
- `develop`: integrasi fitur aktif
- `feature/<nama-fitur>`: branch kerja fitur
- `hotfix/<nama-perbaikan>`: perbaikan cepat produksi

Alur kerja:
1. Buat branch dari `develop`.
2. Kerjakan task kecil per commit.
3. Buka PR ke `develop`.
4. Setelah stabil, merge `develop` ke `main` saat rilis.

## 5. Aturan Commit dan PR

Format commit disarankan:
- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `docs: ...`
- `test: ...`

PR wajib berisi:
1. Ringkasan perubahan
2. Screenshot/video (jika UI berubah)
3. Checklist test yang sudah dijalankan
4. Dampak ke fitur lain

## 6. Definition of Done

Sebuah task dianggap selesai jika:
- [ ] Kode sesuai arsitektur folder
- [ ] Lulus review
- [ ] Lulus test minimum
- [ ] Tidak ada error analyzer
- [ ] Dokumentasi terkait diupdate bila perlu

Sebuah fitur dianggap selesai jika:
- [ ] UI sesuai desain final
- [ ] Routing stabil
- [ ] State berjalan lengkap
- [ ] API terhubung
- [ ] QA sign-off

## 7. Mapping Folder ke Kepemilikan Kerja Tim

- `lib/app`: App shell, router, theme
- `lib/core`: utilitas global, network, error
- `lib/shared`: reusable component lintas fitur
- `lib/features/<fitur>/presentation`: UI + state
- `lib/features/<fitur>/domain`: business rule
- `lib/features/<fitur>/data`: API dan storage
- `docs/`: semua SOP, panduan tim, checklist

## 8. Rencana Sprint Contoh (4 Sprint)

Sprint 1:
- Finalisasi desain dan setup project
- Implement UI Dashboard + Growth

Sprint 2:
- Implement UI Nutrition + Posyandu + Quick Add
- Routing dan shell navigation selesai

Sprint 3:
- State management semua fitur inti
- Domain + data layer siap

Sprint 4:
- Integrasi API
- Testing, bugfix, release prep

## 9. Risiko Umum dan Mitigasi

1. Desain sering berubah di tengah sprint
- Mitigasi: lock desain per sprint, perubahan masuk sprint berikutnya.

2. UI dan API dikerjakan tidak sinkron
- Mitigasi: gunakan mock contract dan endpoint agreement mingguan.

3. File page terlalu besar
- Mitigasi: pecah ke widget kecil dari awal.

4. State logic bercampur dengan network call langsung
- Mitigasi: wajib lewat usecase dan repository.

## 10. Daily Workflow Developer (Praktis)

Satu hari kerja ideal:
1. Tarik update branch terbaru.
2. Kerjakan 1-2 task kecil yang jelas outputnya.
3. Jalankan test lokal.
4. Commit bertahap dengan pesan jelas.
5. Push dan buka PR jika selesai.

## Penutup

Kunci sukses kerja tim di project ini:
- Mulai dari desain yang jelas.
- Implementasi bertahap UI -> routing -> state -> API.
- Disiplin arsitektur dan code review.
- Testing konsisten sebelum merge.

Ikuti alur ini secara konsisten, maka tim bisa membangun aplikasi lebih cepat, rapi, dan minim rework.
