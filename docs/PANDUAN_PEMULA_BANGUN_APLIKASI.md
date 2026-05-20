# Panduan Pemula: Bangun Aplikasi NalarGizi Secara Runtun

Dokumen ini dibuat untuk kamu yang masih awal belajar Flutter dan ingin membangun aplikasi ini langkah demi langkah tanpa bingung.

## Cara Pakai Dokumen Ini

1. Ikuti urutan dari atas ke bawah.
2. Jangan loncat fase.
3. Tiap fase punya output jelas dan checklist.
4. Kalau fase sekarang belum selesai, jangan pindah ke fase berikutnya.

## Gambaran Besar Dulu (Supaya Tidak Bingung)

Aplikasi ini dibagi jadi 3 bagian per fitur:
- `presentation`: tampilan UI dan state (Cubit).
- `domain`: aturan bisnis (entity, usecase, contract repository).
- `data`: ambil/simpan data (API/local) dan implementasi repository.

Alur data sederhananya:
`UI -> Cubit -> UseCase -> Repository -> DataSource`

## Peta File Penting yang Sering Kamu Sentuh

- `lib/main.dart`: pintu masuk aplikasi.
- `lib/app/app.dart`: root app dan konfigurasi MaterialApp.
- `lib/app/router/app_router.dart`: daftar route.
- `lib/features/<fitur>/presentation/pages/*_page.dart`: halaman UI.
- `lib/features/<fitur>/presentation/bloc/*_cubit.dart`: state logic.
- `lib/features/<fitur>/domain/usecases/*_usecase.dart`: aturan use case.
- `lib/features/<fitur>/data/repositories/*_repository_impl.dart`: jembatan domain ke data.

## Fase 0: Jalankan Project Dulu

Tujuan: project bisa jalan di emulator/device.

1. Jalankan:
```bash
flutter pub get
flutter run
```
2. Pastikan app tampil tanpa error merah.

Checklist:
- [ ] `flutter run` sukses
- [ ] Aplikasi terbuka di emulator

## Fase 1: Pahami Navigasi Utama

Tujuan: tahu hubungan antar halaman utama.

Urutan halaman target:
1. Dashboard
2. Growth (Kurva)
3. Nutrition
4. Posyandu
5. Quick Add (dari FAB)
6. Profile

Yang kamu kerjakan:
1. Buka `lib/app/router/app_router.dart`.
2. Pastikan route sudah ada.
3. Nanti hubungkan route ke page satu per satu.

Checklist:
- [ ] Tahu fungsi setiap route
- [ ] Tahu page mana yang dibuka dari tiap menu bawah

## Fase 2: Bangun UI Statis Dulu (Tanpa API)

Tujuan: semua layar jadi dulu mengikuti desain.

Prioritas urutan build UI:
1. `dashboard_page.dart`
2. `growth_page.dart`
3. `nutrition_page.dart`
4. `posyandu_page.dart`
5. `quick_add_page.dart`

Aturan fase ini:
- Belum perlu API.
- Pakai data hardcoded dulu.
- Fokus ke layout, warna, jarak, tipografi.

Checklist:
- [ ] Semua halaman utama sudah ada UI
- [ ] Bottom nav dan FAB terlihat sesuai desain

## Fase 3: Masukkan State Management (Cubit)

Tujuan: halaman tidak hanya statis, sudah punya alur loading/success/error.

Per fitur, kerjakan:
1. Definisikan state di `presentation/bloc/<fitur>_state.dart`.
2. Isi logic di `presentation/bloc/<fitur>_cubit.dart`.
3. Sambungkan page dengan `BlocBuilder`.

State minimal:
- `initial`
- `loading`
- `success`
- `failure`

Checklist:
- [ ] Ada indikator loading
- [ ] Ada tampilan error sederhana
- [ ] Data sukses tampil dari state

## Fase 4: Rapikan Domain Layer

Tujuan: aturan bisnis tidak bercampur dengan UI.

Per fitur, pastikan file ini rapi:
1. `domain/entities/<fitur>_entity.dart`
2. `domain/repositories/<fitur>_repository.dart`
3. `domain/usecases/get_<fitur>_data_usecase.dart`

Checklist:
- [ ] Page tidak memanggil repository langsung
- [ ] Cubit memanggil usecase

## Fase 5: Sambungkan Data Layer

Tujuan: siapkan jalur data dari API/local ke UI.

Per fitur, rapikan:
1. `data/datasources/*_remote_data_source.dart`
2. `data/models/*_model.dart`
3. `data/repositories/*_repository_impl.dart`

Awalnya boleh mock data dulu, format sudah dibuat agar mudah ganti API nanti.

Checklist:
- [ ] Repository impl mengembalikan entity
- [ ] Model punya mapper `fromMap`/`toMap`

## Fase 6: Integrasi API Nyata (Saat Siap)

Tujuan: ganti data dummy menjadi data server.

Langkah:
1. Setup `Dio` di `lib/core/network`.
2. Pindahkan endpoint dan request ke datasource.
3. Mapping response JSON ke model.
4. Tangani error dan ubah ke pesan yang ramah user.

Checklist:
- [ ] Data tampil dari API
- [ ] Error API tidak bikin app crash

## Fase 7: Testing Dasar

Tujuan: fitur aman saat diubah.

Minimal testing:
1. Unit test usecase penting.
2. Widget test halaman utama.
3. Integration test alur penting (contoh: buka app -> dashboard -> quick add).

Perintah:
```bash
flutter test
flutter test integration_test
```

Checklist:
- [ ] Minimal 1 test untuk tiap fitur utama

## Rute Mengerjakan 1 Fitur dari Nol (Template Praktis)

Pakai urutan ini setiap kali bikin fitur baru:

1. Buat/rapikan `*_entity.dart`.
2. Buat contract `*_repository.dart`.
3. Buat usecase `get_*_usecase.dart`.
4. Buat model + datasource.
5. Buat `*_repository_impl.dart`.
6. Buat `*_state.dart` + `*_cubit.dart`.
7. Buat `*_page.dart` + widget pendukung.
8. Hubungkan route.
9. Tambah test minimal.

Kalau urutannya selalu begini, kamu akan lebih konsisten dan tidak mudah tersesat.

## Jadwal Belajar 14 Hari (Disarankan)

Hari 1-2:
- Jalankan project, pahami struktur folder, baca README.

Hari 3-4:
- Routing dan shell navigation.

Hari 5-7:
- UI Dashboard + Growth.

Hari 8-9:
- UI Nutrition + Posyandu + Quick Add.

Hari 10-11:
- Cubit untuk fitur utama.

Hari 12:
- Rapikan domain + data layer.

Hari 13:
- Test dasar.

Hari 14:
- Refactor kecil dan dokumentasi.

## Tanda Kamu Sudah di Jalur Benar

- Kamu tahu file apa yang harus dibuka berikutnya.
- Kamu bisa jelaskan alur `UI -> Cubit -> UseCase -> Repository -> DataSource`.
- Kamu bisa menambah 1 fitur baru tanpa mengacak struktur.

## Ketika Kamu Bingung, Cek Ini Dulu

1. Apakah saya sedang kerja di layer yang benar?
2. Apakah UI memanggil usecase lewat cubit, bukan langsung ke data?
3. Apakah nama file sudah konsisten?
4. Apakah perubahan saya sudah diuji minimal lewat run app?

## Penutup

Kamu tidak perlu langsung menguasai semuanya. Fokus selesaikan satu fase demi satu fase.
Konsistensi urutan kerja jauh lebih penting daripada kecepatan di awal.
