# Tutorial Rute Pembuatan Aplikasi NalarGizi

Dokumen ini adalah panduan urutan kerja (roadmap) membangun aplikasi dari struktur yang sudah ada sampai siap rilis MVP.

## 1. Tujuan dan Scope MVP

Fitur inti MVP:
- Dashboard (ringkasan status anak)
- Kurva Tumbuh Kembang
- Jurnal Nutrisi Harian
- Jadwal Posyandu
- Quick Add (bottom sheet tambah data)
- Login sederhana + profil dasar

Target output MVP:
- Navigasi tab bawah + FAB tengah berjalan
- Data mock tampil konsisten
- Integrasi API dasar siap dipasang
- Unit test dan widget test minimum tersedia

## 2. Rute Pengembangan (Urutan Kerja)

### Fase 0 - Setup Fondasi

1. Pastikan dependency sudah sinkron:
```bash
flutter pub get
```
2. Cek struktur folder sudah sesuai README.
3. Pastikan app entry point sudah ke `NalarGiziApp`.
4. Siapkan branch kerja per fitur (opsional tapi direkomendasikan).

### Fase 1 - Routing dan Shell Navigation

Implementasi awal fokus ke navigasi, bukan desain detail.

1. Gunakan `go_router` di `lib/app/router`.
2. Buat shell dengan:
- Bottom Navigation (4 tab: Beranda, Kurva, Nutrisi, Posyandu)
- FAB tengah untuk `quick_add`
3. Hubungkan route berikut:
- `/dashboard`
- `/growth`
- `/nutrition`
- `/posyandu`
- `/quick-add` (modal/bottom sheet)
- `/profile`

Checklist selesai fase 1:
- Tab berpindah halaman dengan state tab aktif.
- FAB membuka halaman/overlay quick add.
- Deep link dasar per tab bisa diakses.

### Fase 2 - Bangun UI Halaman per Fitur

Bangun UI statis dulu sesuai desain (tanpa API):

1. `dashboard_page.dart`
- Header anak
- Kartu indikator (usia, berat, status)
- Tip harian
- Jadwal terdekat

2. `growth_page.dart`
- Segmen berat/tinggi
- Kartu pengukuran terakhir
- Grafik pertumbuhan (pakai data dummy)
- Riwayat pengukuran

3. `nutrition_page.dart`
- Ringkasan kalori
- Progress nutrisi
- Daftar makan harian

4. `posyandu_page.dart`
- Ringkasan imunisasi
- Kartu jadwal datang
- CTA tindakan

5. `quick_add_page.dart`
- Bottom sheet opsi tambah data
- Aksi ke form relevan

Checklist selesai fase 2:
- Semua halaman tampil sesuai hierarchy desain.
- Komponen reusable dipindahkan ke `shared/widgets` jika dipakai >1 fitur.

### Fase 3 - State Management (Cubit/Bloc)

1. Per fitur, aktifkan cubit di:
- `presentation/bloc/<feature>_cubit.dart`
- `presentation/bloc/<feature>_state.dart`
2. Definisikan state minimal:
- `initial`, `loading`, `success`, `failure`
3. Integrasikan UI agar membaca state cubit.

Checklist selesai fase 3:
- Loading/error/success state terlihat jelas di UI.
- Tidak ada logic bisnis berat di widget page.

### Fase 4 - Data Layer dan Domain

1. Domain:
- Rapikan `entity`, `repository contract`, `usecase` per fitur.
2. Data:
- Hubungkan `datasource` + `repository impl`.
- Mapping model ke entity.
3. Core network:
- Setup `Dio`, interceptor, error handler di `lib/core/network`.

Checklist selesai fase 4:
- Data source mock dapat diganti API tanpa ubah UI besar-besaran.
- Alur data: UI -> Cubit -> UseCase -> Repository -> DataSource.

### Fase 5 - Integrasi API dan Local Storage

1. Tambahkan endpoint API nyata ke `core/network`.
2. Simpan cache sederhana:
- `shared_preferences` untuk preferensi ringan.
- `hive` untuk cache data terstruktur.
3. Tambahkan sinkronisasi online/offline dasar.

Checklist selesai fase 5:
- Data utama berasal dari API.
- Ada fallback saat offline.

### Fase 6 - Testing dan Hardening

1. Unit test:
- Use case dan repository.
2. Widget test:
- Halaman tab utama dan komponen penting.
3. Integration test:
- Flow login -> dashboard -> quick add.

Perintah yang sering dipakai:
```bash
flutter test
flutter test integration_test
```

Checklist selesai fase 6:
- Jalur utama user tidak error.
- Kasus gagal API punya handling yang jelas.

### Fase 7 - Release Prep

1. Ganti app icon/splash final.
2. Cek versioning di `pubspec.yaml`.
3. Build release:
```bash
flutter build apk --release
flutter build appbundle --release
```
4. Buat release note.

## 3. Mapping Folder ke Aktivitas Kerja

- `lib/app`: konfigurasi global aplikasi (theme, router).
- `lib/core`: utilitas fundamental (network, error, constants).
- `lib/shared`: widget/service umum lintas fitur.
- `lib/features/<feature>`:
- `data`: API/local
- `domain`: aturan bisnis
- `presentation`: UI + state

## 4. Contoh Sprint Plan (Opsional)

Sprint 1 (Minggu 1):
- Routing + shell nav + dashboard UI statis

Sprint 2 (Minggu 2):
- Growth + Nutrition UI + state management

Sprint 3 (Minggu 3):
- Posyandu + Quick Add + data layer mock

Sprint 4 (Minggu 4):
- Integrasi API + testing + polishing release

## 5. Definition of Done per Fitur

Sebuah fitur dianggap selesai jika:
1. Struktur `data/domain/presentation` lengkap.
2. Halaman utama fitur tampil sesuai desain.
3. State `loading/success/error` berjalan.
4. Minimal 1 unit test atau widget test tersedia.
5. Route fitur sudah terhubung dari navigasi utama.

## 6. Catatan Penting Implementasi

- Hindari menaruh logic API langsung di widget.
- Gunakan entity sebagai kontrak utama domain.
- Komponen berulang dipindah ke `shared/widgets`.
- Pertahankan naming konsisten agar onboarding tim lebih cepat.

---

Jika dibutuhkan, dokumen ini bisa dipecah lagi menjadi:
- `docs/ROUTING_GUIDE.md`
- `docs/STATE_MANAGEMENT_GUIDE.md`
- `docs/API_INTEGRATION_GUIDE.md`
- `docs/TESTING_GUIDE.md`
