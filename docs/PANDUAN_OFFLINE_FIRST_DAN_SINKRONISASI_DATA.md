# Panduan Offline-First dan Sinkronisasi Data NalarGizi

Dokumen ini dibuat untuk membantu tim NalarGizi membangun fitur yang tetap bisa dipakai saat offline, tetapi tetap sinkron ke server saat koneksi kembali tersedia.

Dokumen ini mengikuti best practice industri saat ini untuk aplikasi mobile yang:
1. Tetap bisa dipakai tanpa internet.
2. Tetap menampilkan data terakhir yang tersimpan.
3. Menyimpan aksi user ke penyimpanan lokal lebih dulu.
4. Melakukan sinkronisasi ke server secara aman setelah koneksi tersedia.

Dokumen ini cocok dipakai untuk fitur seperti:
- Posyandu
- Growth
- Nutrition
- Quick Add

## 1. Konsep Dasar yang Harus Dipahami

Dalam arsitektur mobile modern, aplikasi Flutter tidak berbicara langsung ke database server.

Alur yang benar adalah:

`Flutter App -> API Server -> Database Server`

Kalau aplikasi harus tetap jalan saat offline, maka tambahkan penyimpanan lokal di device:

`Flutter App -> Local Storage`

dan saat online:

`Flutter App -> API Server -> Database Server`

Dengan begitu, ada 3 sumber data yang harus dipahami:
1. `Remote data`: data dari server.
2. `Local cache`: salinan data terakhir yang disimpan di device.
3. `Pending sync queue`: daftar perubahan user yang belum berhasil dikirim ke server.

## 2. Prinsip Best Practice Industri

Prinsip yang paling aman dan banyak dipakai saat ini:

1. UI membaca data utama dari local storage.
2. Saat online, app melakukan refresh ke server.
3. Hasil server disimpan ke local storage.
4. Saat user melakukan perubahan data, perubahan disimpan ke local lebih dulu.
5. Sinkronisasi ke server berjalan setelah itu, bukan sebelum itu.
6. Jika gagal kirim ke server, data tetap aman di local dan diberi status pending.

Ini biasa disebut `offline-first with eventual sync`.

## 3. Kenapa Bukan Langsung Tulis ke Server?

Kalau aplikasi selalu menunggu server:
- UI akan terasa lambat.
- Fitur berhenti total saat internet tidak ada.
- Risiko kehilangan input user lebih besar jika request gagal.

Kalau aplikasi menyimpan ke local lebih dulu:
- User tetap bisa lanjut bekerja.
- UI langsung responsif.
- Data tidak hilang walaupun koneksi putus.
- Sinkronisasi bisa dicoba ulang dengan aman.

## 4. Arsitektur yang Disarankan untuk Repo Ini

Gunakan pola berikut:

`Page UI -> Cubit -> UseCase -> Repository -> LocalDataSource + RemoteDataSource`

Repository menjadi tempat keputusan utama:
- ambil dari local dulu,
- refresh dari remote jika memungkinkan,
- simpan hasil remote ke local,
- antrekan perubahan user jika belum bisa dikirim.

Skema sederhananya:

```text
UI
  -> Cubit
    -> UseCase
      -> Repository
        -> LocalDataSource
        -> RemoteDataSource
```

## 5. Case yang Paling Realistis di Industri

### Case A: App dibuka saat online

Target perilaku:
1. App menampilkan cache lokal lebih dulu jika ada.
2. App mengambil data terbaru dari server.
3. Jika sukses, local cache diperbarui.
4. UI menampilkan data terbaru.

Alur:
1. `Repository.getPosyanduData()` dipanggil.
2. Baca data dari local.
3. Emit data local ke UI.
4. Cek koneksi.
5. Jika online, fetch remote.
6. Simpan hasil remote ke local.
7. Emit ulang data terbaru.

Ini adalah pola yang paling umum dipakai pada aplikasi produksi.

### Case B: App dibuka saat offline

Target perilaku:
1. App tetap menampilkan data cache terakhir.
2. App memberi indikator bahwa data belum terbaru.
3. Tidak ada crash walaupun server tidak bisa diakses.

Alur:
1. `Repository.getPosyanduData()` dipanggil.
2. Baca data dari local.
3. Emit data ke UI.
4. Skip remote fetch karena offline.
5. Tampilkan badge seperti `Offline` atau `Menampilkan data terakhir`.

### Case C: User menambah data saat offline

Contoh untuk Posyandu:
- user menambah jadwal posyandu baru,
- user menandai kunjungan sebagai selesai,
- user memperbarui catatan pemeriksaan.

Target perilaku:
1. Data langsung muncul di UI.
2. Data langsung tersimpan di local.
3. Status item menjadi `pending_sync`.
4. Saat internet kembali, item dikirim ke server.

Alur:
1. User submit form.
2. Repository menyimpan data ke local.
3. Local item diberi `syncStatus = pending`.
4. UI diperbarui dari local data.
5. Background sync mencoba kirim ke server.
6. Jika sukses, status berubah jadi `synced`.
7. Jika gagal, tetap `pending` atau `failed`.

### Case D: User mengedit data yang sudah pernah sinkron

Target perilaku:
1. Perubahan langsung terlihat di UI.
2. Versi local diperbarui dulu.
3. Server diperbarui kemudian.

Alur:
1. User edit item.
2. Simpan perubahan ke local.
3. Tambahkan job queue `update`.
4. Saat online, job queue memanggil endpoint update.
5. Jika sukses, tandai sinkron.

### Case E: User menghapus data saat offline

Ini case yang sering lupa ditangani.

Aturan yang aman:
1. Jika item belum pernah tersinkron ke server, hapus langsung dari local.
2. Jika item sudah punya `serverId`, tandai local sebagai `isDeleted = true` atau buat queue `delete`.
3. Saat online, kirim request delete ke server.
4. Setelah sukses, hapus permanen dari local.

Ini lebih aman daripada langsung membuang data lokal tanpa jejak.

## 6. Source of Truth yang Disarankan

Dalam implementasi offline-first, gunakan aturan ini:

1. `Server` adalah source of truth jangka panjang.
2. `Local storage` adalah source of truth operasional untuk UI.
3. `Sync queue` adalah source of truth untuk perubahan yang belum selesai dikirim.

Artinya:
- UI sebaiknya membaca dari local.
- Repository yang bertanggung jawab menyamakan local dengan remote.

## 7. Struktur Folder yang Disarankan

Untuk tiap fitur yang mendukung offline-first, struktur minimumnya seperti ini:

```text
lib/features/posyandu/
  data/
    datasources/
      posyandu_remote_data_source.dart
      posyandu_local_data_source.dart
      posyandu_sync_queue_data_source.dart
    models/
      posyandu_model.dart
      posyandu_local_model.dart
      posyandu_sync_job_model.dart
    repositories/
      posyandu_repository_impl.dart
  domain/
    entities/
      posyandu_entity.dart
      posyandu_schedule_item_entity.dart
      sync_job_entity.dart
    repositories/
      posyandu_repository.dart
    usecases/
      get_posyandu_data_usecase.dart
      save_posyandu_schedule_usecase.dart
      sync_posyandu_pending_changes_usecase.dart
  presentation/
    bloc/
      posyandu_cubit.dart
      posyandu_state.dart
    pages/
      posyandu_page.dart
```

Di level core, tambahkan service pendukung:

```text
lib/core/
  network/
    api_client.dart
    network_exception.dart
  storage/
    hive_boxes.dart
    local_storage_service.dart
  sync/
    sync_manager.dart
    sync_status.dart
```

## 8. Package yang Cocok untuk Project Ini

Berdasarkan dependency yang sudah ada, kombinasi yang cocok:

1. `hive` atau `hive_flutter`
- untuk cache local dan queue sinkronisasi.

2. `connectivity_plus`
- untuk mendeteksi perubahan status koneksi.

3. `dio`
- untuk request API dan retry logic.

4. `flutter_bloc`
- untuk mengelola state UI loading, success, failure, syncing.

## 9. Bentuk Data Lokal yang Disarankan

Untuk item Posyandu, sebaiknya local model punya field tambahan di luar field bisnis biasa.

Minimal field:
- `localId`
- `serverId` nullable
- `title`
- `category`
- `location`
- `scheduledAt`
- `note`
- `isCompleted`
- `syncStatus`
- `lastModifiedAt`
- `isDeleted`

Kenapa perlu `localId` dan `serverId`?

Karena item yang dibuat saat offline belum punya ID dari server.
Maka:
- local pakai `localId`,
- setelah sukses upload, barulah simpan `serverId`.

## 10. Bentuk Queue Sinkronisasi yang Disarankan

Simpan queue dalam model terpisah.

Minimal field queue:
- `jobId`
- `entityType`
- `entityLocalId`
- `operationType` (`create`, `update`, `delete`)
- `payload`
- `status`
- `retryCount`
- `createdAt`
- `lastTriedAt`

Kenapa perlu queue terpisah?

Karena data utama dan daftar operasi sinkronisasi adalah dua hal berbeda.

Contoh:
- data jadwal posyandu tersimpan di box `posyandu_items`
- operasi pending tersimpan di box `sync_jobs`

## 11. Alur Repository yang Direkomendasikan

### 11.1 Get Data

Alur terbaik:
1. Baca local cache.
2. Emit data local ke UI.
3. Jika online, fetch remote.
4. Simpan hasil remote ke local.
5. Emit local terbaru.

### 11.2 Create Data

Alur terbaik:
1. Simpan data ke local.
2. Tambah queue job `create`.
3. Emit UI dari local.
4. Jika online, proses sync segera.

### 11.3 Update Data

Alur terbaik:
1. Update local.
2. Tambah queue job `update`.
3. Emit UI dari local.
4. Sinkronkan saat online.

### 11.4 Delete Data

Alur terbaik:
1. Tandai local `isDeleted = true` atau soft delete.
2. Tambah queue job `delete`.
3. Hilangkan dari UI jika perlu.
4. Hapus permanen setelah server berhasil menerima delete.

## 12. Strategi Sync yang Direkomendasikan

Strategi paling aman untuk tahap awal:

1. Proses queue satu per satu.
2. Urutkan berdasarkan waktu dibuat.
3. Jika satu job gagal, hentikan batch saat itu.
4. Coba lagi saat koneksi atau aplikasi aktif kembali.

Ini lebih mudah dijaga daripada sync paralel sejak awal.

## 13. Trigger Sinkronisasi yang Baik

Sinkronisasi bisa dijalankan saat:
1. app dibuka,
2. user kembali ke halaman fitur,
3. koneksi berubah dari offline ke online,
4. user menekan tombol retry manual,
5. app resume dari background.

Untuk pemula, kombinasi paling aman:
1. sync saat app start,
2. sync saat koneksi kembali online,
3. sync saat user menekan retry.

## 14. Status UI yang Sebaiknya Ditampilkan

Best practice di industri bukan menyembunyikan status sinkronisasi sepenuhnya.

Minimal tampilkan:
1. `Loading`
2. `Offline - menampilkan data terakhir`
3. `Perubahan menunggu sinkronisasi`
4. `Sinkronisasi gagal, coba lagi`
5. `Sinkronisasi berhasil`

Contoh penerapan di Posyandu:
- badge kecil `Offline`
- label `2 perubahan belum tersinkron`
- tombol `Coba sinkronisasi lagi`

## 15. Conflict Handling yang Direkomendasikan

Konflik terjadi saat data local dan server berubah di waktu yang berbeda.

Untuk MVP, pilih aturan sederhana:
1. `Last write wins`, atau
2. server menang untuk data tertentu.

Untuk tahap awal project ini, sarankan:
- pakai `lastModifiedAt`,
- tentukan aturan jelas di backend,
- jangan membuat merge logic rumit dulu.

Kalau belum ada kebutuhan multi-device yang kompleks, aturan sederhana sudah cukup.

## 16. Kesalahan Umum yang Harus Dihindari

1. UI membaca langsung dari remote saja.
Akibat: saat offline layar kosong atau error.

2. Menyimpan cache tanpa queue sinkronisasi.
Akibat: perubahan user saat offline bisa hilang.

3. Menyimpan queue tanpa metadata operasi.
Akibat: app tidak tahu harus `create`, `update`, atau `delete`.

4. Menghapus data local sebelum server konfirmasi.
Akibat: data bisa hilang permanen.

5. Tidak membedakan `localId` dan `serverId`.
Akibat: susah map item offline yang belum pernah tersinkron.

6. Retry tanpa batas dan tanpa jeda.
Akibat: spam request dan sulit debug.

## 17. SOP Implementasi Bertahap untuk Tim

Urutan paling aman:

### Tahap 1 - Cache Read Only
Target:
- data server bisa disimpan ke local,
- app tetap bisa menampilkan data terakhir saat offline.

Checklist:
- [ ] LocalDataSource dibuat
- [ ] Remote GET disimpan ke local
- [ ] UI membaca data dari local

### Tahap 2 - Simpan Perubahan Lokal
Target:
- user bisa tambah/ubah/hapus saat offline,
- perubahan tersimpan lokal.

Checklist:
- [ ] Model punya `syncStatus`
- [ ] Create/update/delete masuk local dulu
- [ ] UI menandai data pending

### Tahap 3 - Queue Sinkronisasi
Target:
- perubahan pending dikirim ke server saat koneksi ada.

Checklist:
- [ ] Sync job model dibuat
- [ ] Queue data source dibuat
- [ ] Retry basic dibuat

### Tahap 4 - Status dan Retry UI
Target:
- user tahu kondisi data dan bisa retry bila perlu.

Checklist:
- [ ] Indicator offline dibuat
- [ ] Indicator pending sync dibuat
- [ ] Tombol retry dibuat

## 18. Case Implementasi Khusus untuk Posyandu

Contoh case nyata di NalarGizi:

### Case 1: Tambah Jadwal Posyandu Saat Offline
1. Ibu menambah jadwal posyandu bulan depan.
2. Jadwal langsung muncul di list.
3. Status item `pending sync`.
4. Saat internet kembali, jadwal dikirim ke server.
5. Setelah sukses, item mendapat `serverId`.

### Case 2: Tandai Kunjungan Selesai Saat Offline
1. User menekan tombol `Tandai Selesai`.
2. Item langsung pindah ke riwayat di local UI.
3. Queue `update` atau `patch` dibuat.
4. Saat online, perubahan status dikirim ke server.

### Case 3: App Dibuka di Puskesmas dengan Sinyal Buruk
1. App menampilkan jadwal terakhir dari cache.
2. App memberi label `Offline`.
3. Saat sinyal membaik, refresh berjalan.
4. Data lokal diperbarui tanpa user kehilangan progress.

## 19. Checklist Final Best Practice

- [ ] UI membaca dari local, bukan remote langsung.
- [ ] GET dari server disimpan ke local cache.
- [ ] Perubahan user masuk local dulu.
- [ ] Semua perubahan punya `syncStatus`.
- [ ] Queue operasi `create/update/delete` tersedia.
- [ ] Ada pembeda `localId` dan `serverId`.
- [ ] Ada retry sync yang aman.
- [ ] Ada indikator offline/pending/error di UI.
- [ ] Delete offline tidak langsung buang data permanen.
- [ ] Semua alur minimal diuji manual.

## 20. Rekomendasi Implementasi untuk Project Ini

Kalau mengikuti kondisi repo sekarang, urutan paling tepat adalah:

1. Lengkapi `RemoteDataSource` yang sudah ada.
2. Tambahkan `LocalDataSource` berbasis Hive.
3. Tambahkan `SyncQueueDataSource` berbasis Hive.
4. Ubah repository agar local-first.
5. Tambahkan status sinkronisasi di entity/model local.
6. Tambahkan sync manager sederhana.
7. Tambahkan indikator sync di UI Posyandu.

## 21. Penutup

Best practice industri saat ini untuk aplikasi mobile bukan memilih antara online atau offline, tetapi membuat aplikasi tetap berguna dalam kedua kondisi.

Aturan emasnya:
- tampilkan dari local,
- refresh dari remote,
- simpan perubahan user ke local dulu,
- sinkronkan ke server setelahnya.

Kalau pola ini diterapkan dengan disiplin, aplikasi NalarGizi akan lebih stabil, lebih cepat terasa di user, dan jauh lebih siap dipakai di kondisi lapangan yang internetnya tidak selalu bagus.