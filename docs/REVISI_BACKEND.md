# Revisi dan Rekomendasi Tambahan Backend NalarGizi

Dokumen ini berisi hasil evaluasi terhadap [BACKEND_README.md](file:///d:/Tugas/SEMESTER%206/Mobile/nalargizi/docs/BACKEND_README.md) berdasarkan analisis source code Flutter (`lib/`) dan konfigurasi package (`pubspec.yaml`). Dokumen ini berfungsi sebagai panduan revisi untuk memastikan backend siap mendukung arsitektur aplikasi Flutter yang sesungguhnya (terutama kebutuhan *offline-first* dan *eventual synchronization*).

---

## 1. Analisis Kesenjangan Utama (Key Gaps)

Setelah memeriksa seluruh folder `lib/` (terutama model data yang masih berupa *mock stub* `id`, `title`, `description`) dan panduan sinkronisasi data, ditemukan beberapa kesenjangan kritis antara desain backend saat ini dengan kebutuhan riil aplikasi:

### A. Kebutuhan Mutlak *Offline-First* (Belum Terakomodasi di Backend)
Dokumen [PANDUAN_OFFLINE_FIRST_DAN_SINKRONISASI_DATA.md](file:///d:/Tugas/SEMESTER%206/Mobile/nalargizi/docs/PANDUAN_OFFLINE_FIRST_DAN_SINKRONISASI_DATA.md) menekankan bahwa aplikasi menggunakan **Hive** untuk menyimpan perubahan data secara lokal saat *offline* dan menyinkronkannya kembali ketika *online*. Namun, desain database dan API di `BACKEND_README.md` belum mendukung flow ini secara penuh:
1. **Tidak Ada Soft Delete untuk Data Kesehatan**: Jika pengguna menghapus catatan pertumbuhan (*growth record*) atau jurnal nutrisi saat *offline*, aplikasi tidak boleh langsung menghapusnya secara fisik di database lokal sebelum disinkronkan ke server. Server harus mendukung kolom `deleted_at` (Soft Delete) pada tabel data kesehatan agar saat sinkronisasi berjalan, server mengetahui bahwa baris tersebut telah dihapus oleh pengguna.
2. **Ketiadaan Kolom Sinkronisasi**: Tabel `growth_records`, `nutrition_journals`, `nutrition_meals`, `hydration_logs`, dan `posyandu_schedules` membutuhkan kolom `updated_at` atau `last_modified_at` yang presisi serta penanganan status sinkronisasi.
3. **Penyediaan UUID oleh Client (Client-Side UUID)**: Karena data dibuat saat *offline*, primary key `id` (UUID) harus digenerate di sisi aplikasi Flutter menggunakan package UUID, kemudian dikirim ke server. Server harus menerima dan menggunakan UUID yang dikirim oleh client, bukan membuat UUID baru secara otomatis, untuk menghindari duplikasi saat pengiriman ulang (*idempotency*).

### B. Ketiadaan Endpoint Sinkronisasi Massal (Bulk/Batch Sync Endpoint)
Mengirimkan 20 catatan makan harian atau 10 jurnal hidrasi satu-persatu melalui koneksi internet seluler yang tidak stabil (terutama di daerah posyandu pedesaan) akan menyebabkan pemborosan daya baterai, waktu tunggu lama, dan risiko kegagalan tinggi (*network timeout*).
* **Rekomendasi**: Backend wajib menyediakan endpoint **Bulk Sync** (misal: `POST /api/v1/sync`) yang menerima daftar operasi (*create, update, delete*) dalam satu request payload JSON, memprosesnya dalam satu database transaction, dan mengembalikan status keberhasilan per item.

### C. Redundansi & Inkonsistensi Data Hidrasi (Hydration)
Terdapat tumpang tindih desain di `BACKEND_README.md`:
* Tabel `nutrition_meals` memiliki tipe meal `hydration`.
* Tabel `nutrition_journals` memiliki kolom `total_water_ml`.
* Terdapat tabel terpisah `hydration_logs` yang mencatat `cups_target` dan `cups_consumed`.
* **Rekomendasi**: Sesuai dengan tampilan UI nyata di [nutrition_page.dart](file:///d:/Tugas/SEMESTER%206/Mobile/nalargizi/lib/features/nutrition/presentation/pages/nutrition_page.dart) (bagian *"4 dari 6 gelas terpenuhi"*), pencatatan hidrasi sebaiknya dipusatkan di tabel `hydration_logs` berbasis harian, sedangkan `nutrition_meals` khusus untuk makanan padat/MPASI. Kolom `total_water_ml` di `nutrition_journals` dapat diisi secara otomatis oleh server (dihitung dari `hydration_logs`) atau dihapus untuk menghindari inkonsistensi data.

### D. Model Mock Frontend vs Realitas UI
Hampir seluruh modul di `lib/features/` (kecuali Posyandu) masih menggunakan model data generik/mock:
```dart
// Contoh di growth_model.dart, nutrition_model.dart, dll.
class GrowthModel extends GrowthEntity {
  const GrowthModel({required super.id, required super.title, required super.description});
}
```
Sedangkan halaman UI seperti `GrowthPage` menampilkan kurva berat badan (BB) dan tinggi badan (TB) dari waktu ke waktu berdasarkan standar WHO. Backend harus menyediakan data referensi WHO ini agar aplikasi dapat menghitung Z-score secara dinamis atau menampilkannya di grafik.

---

## 2. Revisi Skema Database (Database Schema Improvements)

Berikut adalah modifikasi tabel database untuk mendukung sinkronisasi offline, deteksi konflik, dan integrasi data WHO.

### A. Penambahan Kolom Metadata Sinkronisasi & Soft Delete
Semua tabel transaksi medis/kesehatan anak (`growth_records`, `nutrition_journals`, `nutrition_meals`, `hydration_logs`, `posyandu_schedules`, `immunization_records`) wajib dilengkapi dengan kolom berikut:

| Field | Type | Nullable | Description |
|---|---|---|---|
| client_created_at | TIMESTAMP | No | Waktu pembuatan di device client (untuk urutan kronologis asli) |
| last_modified_at | TIMESTAMP | No | Waktu modifikasi terakhir di client/server (untuk deteksi konflik) |
| deleted_at | TIMESTAMP | Yes | Untuk mencatat soft delete yang dilakukan saat offline |

### B. Tabel Baru: `who_growth_standards` (Penting untuk Fitur Kurva Tumbuh Kembang)
Untuk menampilkan kurva pertumbuhan WHO (Z-score -3, -2, 0, 2, 3) pada grafik di Flutter, backend harus menyimpan dan menyediakan data standar WHO.

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | INT | No | Primary key (Auto Increment) |
| gender | ENUM(male, female) | No | Jenis kelamin anak |
| age_months | INT | No | Usia anak dalam bulan (0 - 60) |
| metric | ENUM(weight, height, bmi, head) | No | Jenis indikator pertumbuhan |
| sd3neg | DECIMAL(6,2) | No | Nilai batas Z-Score -3 |
| sd2neg | DECIMAL(6,2) | No | Nilai batas Z-Score -2 |
| sd1neg | DECIMAL(6,2) | No | Nilai batas Z-Score -1 |
| median | DECIMAL(6,2) | No | Nilai Median (Z-Score 0) |
| sd1 | DECIMAL(6,2) | No | Nilai batas Z-Score +1 |
| sd2 | DECIMAL(6,2) | No | Nilai batas Z-Score +2 |
| sd3 | DECIMAL(6,2) | No | Nilai batas Z-Score +3 |

*Indeks:* Gabungan pada `(gender, metric, age_months)`.

---

## 3. Revisi Desain API & Endpoint Baru

### A. Endpoint Bulk Synchronization (CRITICAL)
* **Endpoint**: `POST /api/v1/sync`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "lastSyncedAt": "2026-05-19T12:00:00Z",
  "operations": [
    {
      "action": "create",
      "type": "growth",
      "clientUniqueId": "d3b07384-d113-4467-a068-d018c1d563a1",
      "data": {
        "childId": "8f8e028b-b184-4861-8f55-7389c25dfb0d",
        "measuredAt": "2026-05-20",
        "weightKg": 10.4,
        "heightCm": 82.5,
        "headCircumferenceCm": 46.2,
        "notes": "Pengukuran offline",
        "clientCreatedAt": "2026-05-20T06:15:00Z"
      }
    },
    {
      "action": "update",
      "type": "posyandu_schedule",
      "clientUniqueId": "a902df3b-8f3a-4428-ba17-742a031e5052",
      "data": {
        "isCompleted": true,
        "completedAt": "2026-05-20T08:30:00Z",
        "lastModifiedAt": "2026-05-20T08:35:00Z"
      }
    },
    {
      "action": "delete",
      "type": "nutrition_meal",
      "clientUniqueId": "fe87a6c9-cc8d-4f2b-8a8b-11c79a40fb98"
    }
  ]
}
```

* **Response Payload (Success)**:
```json
{
  "success": true,
  "message": "Sync completed successfully",
  "data": {
    "syncTime": "2026-05-20T13:25:00Z",
    "results": [
      { "clientUniqueId": "d3b07384-d113-4467-a068-d018c1d563a1", "status": "synced" },
      { "clientUniqueId": "a902df3b-8f3a-4428-ba17-742a031e5052", "status": "synced" },
      { "clientUniqueId": "fe87a6c9-cc8d-4f2b-8a8b-11c79a40fb98", "status": "deleted" }
    ]
  }
}
```

* **Response Payload (Conflict - HTTP 409 Conflict)**:
Jika terdapat ketidakcocokan versi data (misalnya data di server sudah diubah oleh bidan posyandu dengan waktu modifikasi yang lebih baru dibanding data lokal orang tua):
```json
{
  "success": false,
  "message": "Conflict detected during synchronization",
  "errors": [
    {
      "clientUniqueId": "a902df3b-8f3a-4428-ba17-742a031e5052",
      "errorType": "conflict",
      "serverData": {
        "id": "a902df3b-8f3a-4428-ba17-742a031e5052",
        "title": "Jadwal Posyandu Bulanan",
        "isCompleted": true,
        "completedAt": "2026-05-20T08:00:00Z",
        "lastModifiedAt": "2026-05-20T08:10:00Z"
      }
    }
  ]
}
```

### B. Endpoint Autentikasi Sosial (Social OAuth - Google / Apple Sign-In)
Mobile app modern memerlukan kemudahan sign-in. Backend harus siap menerima token OAuth dari Google/Apple SDK di Flutter.
* **Endpoint**: `POST /api/v1/auth/oauth`
* **Request Payload**:
```json
{
  "provider": "google",
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```
* **Response**: Sama seperti format login biasa (mengembalikan JWT `accessToken` & `refreshToken`).

### C. Endpoint Pengambilan Referensi Kurva WHO
* **Endpoint**: `GET /api/v1/growth-standards?gender=female&metric=weight`
* **Response**: Mengembalikan list array koordinat umur (bulan) dan nilai Z-Score standar WHO untuk digambar di grafik Flutter (`fl_chart` atau `syncfusion_flutter_charts`).
```json
{
  "success": true,
  "data": [
    { "ageMonths": 0, "sd3neg": 2.0, "sd2neg": 2.4, "sd1neg": 2.8, "median": 3.2, "sd1": 3.7, "sd2": 4.2, "sd3": 4.8 },
    { "ageMonths": 1, "sd3neg": 2.7, "sd2neg": 3.2, "sd1neg": 3.6, "median": 4.2, "sd1": 4.8, "sd2": 5.5, "sd3": 6.2 }
    // ... dst sampai 60 bulan
  ]
}
```

---

## 4. Panduan Refactoring Model & Entity di Flutter (Frontend)

Agar frontend dapat terintegrasi dengan revisi backend ini, model mock di `lib/features/` harus diubah total mengikuti struktur bisnis riil:

### A. Growth Module (`lib/features/growth/`)
Refactor [growth_model.dart](file:///d:/Tugas/SEMESTER%206/Mobile/nalargizi/lib/features/growth/data/models/growth_model.dart) dan `growth_entity.dart` dari data mock menjadi struktur data medis:
```dart
class GrowthRecordModel {
  final String id; // UUID generated by client
  final String childId;
  final DateTime measuredAt;
  final double weightKg;
  final double heightCm;
  final double? headCircumferenceCm;
  final double? zScoreWeight; // Diisi oleh server atau hasil hitung client
  final double? zScoreHeight;
  final double? zScoreBmi;
  final String? notes;
  final String syncStatus; // 'synced', 'pending', 'failed'
  final DateTime lastModifiedAt;

  // Lengkapi dengan fromMap() dan toMap()
}
```

### B. Nutrition Module (`lib/features/nutrition/`)
Pecah model mock [nutrition_model.dart](file:///d:/Tugas/SEMESTER%206/Mobile/nalargizi/lib/features/nutrition/data/models/nutrition_model.dart) menjadi dua model representatif sesuai relasi database:
1. **NutritionJournalModel**:
   Mewakili jurnal harian anak (kalori, makronutrisi, catatan harian).
2. **NutritionMealModel**:
   Mewakili slot makanan (Sarapan, Makan Siang, Makan Malam) dengan atribut `mealType`, `title`, `calories`, `portion`, `statusLabel`, dan `statusColor`.
3. **HydrationLogModel**:
   Mewakili progres minum air harian anak (`cupsTarget`, `cupsConsumed`).

### C. Profile Module (`lib/features/profile/`)
Refactor [profile_model.dart](file:///d:/Tugas/SEMESTER%206/Mobile/nalargizi/lib/features/profile/data/models/profile_model.dart) untuk menampung:
* Informasi Pengguna (`id`, `fullName`, `email`, `role`).
* Daftar anak yang dipantau (List of `ChildModel`), karena satu akun orang tua/pengasuh dapat memantau lebih dari satu anak.

---

## 5. Kesimpulan & Roadmap Implementasi Backend

Desain awal backend di `BACKEND_README.md` sudah sangat rapi dari sisi struktur monolit NestJS dan relasi database dasar. Namun, agar aplikasi dapat digunakan dengan lancar di dunia nyata (offline-first, minim gangguan koneksi, kalkulasi grafik kurva pertumbuhan WHO), penambahan-penambahan di atas bersifat **wajib**.

### Langkah Selanjutnya untuk Pengembang Backend:
1. **Gunakan UUID** sebagai tipe data primer ID di semua tabel (PostgreSQL).
2. **Tambahkan kolom metadata** (`client_created_at`, `last_modified_at`, `deleted_at`) pada setiap tabel rekam medis.
3. **Buat seeder untuk data standar WHO** (`who_growth_standards`) agar client dapat menggambar grafik pertumbuhan.
4. **Implementasikan endpoint `/api/v1/sync`** dengan logika pemrosesan batch transaksi dan deteksi konflik.
5. **Tambahkan integrasi Google/Apple Auth** di module `auth` NestJS.
