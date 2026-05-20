# Panduan UI Dari Struktur Folder NalarGizi

Dokumen ini fokus khusus untuk membangun UI dari struktur folder project yang sudah ada.
Panduan ini tidak membahas API terlebih dulu, supaya kamu bisa fokus ke tampilan sampai rapi.

## Tujuan Dokumen

Setelah mengikuti panduan ini, kamu bisa:
1. Tahu file mana yang harus dikerjakan terlebih dulu.
2. Membangun UI per halaman dengan pola yang konsisten.
3. Memisahkan widget agar kode tetap rapi dan mudah dirawat.

## Struktur Folder yang Dipakai Saat Membangun UI

```text
lib/
  app/
    theme/
      app_theme.dart
  shared/
    widgets/
  features/
    dashboard/
      presentation/
        pages/
        widgets/
    growth/
      presentation/
        pages/
        widgets/
    nutrition/
      presentation/
        pages/
        widgets/
    posyandu/
      presentation/
        pages/
        widgets/
    quick_add/
      presentation/
        pages/
        widgets/
```

Fokus kamu untuk UI ada di:
- `presentation/pages`: halaman utama fitur.
- `presentation/widgets`: komponen kecil yang dipakai halaman fitur.
- `shared/widgets`: komponen reusable lintas fitur.
- `app/theme/app_theme.dart`: warna, text style, dan tema global.

## Aturan Dasar Sebelum Mulai UI

1. Buat halaman dulu, data hardcoded dulu.
2. Jangan panggil API di tahap UI.
3. Satu file page jangan terlalu besar, pecah ke widgets.
4. UI harus tetap enak dilihat di lebar layar kecil dan besar.

## Urutan Pengerjaan UI (Disarankan)

Kerjakan berurutan seperti ini:

1. `dashboard_page.dart`
2. `growth_page.dart`
3. `nutrition_page.dart`
4. `posyandu_page.dart`
5. `quick_add_page.dart`

Alasan urutan ini:
- Dashboard jadi acuan style global.
- Growth/Nutrition/Posyandu mengikuti pola card dan section yang sama.
- Quick Add paling cepat dibuat setelah komponen dasar siap.

## Langkah Detail Membangun 1 Halaman UI

Contoh langkah untuk setiap file `*_page.dart`:

1. Buat `Scaffold` dasar.
2. Buat struktur section memakai `ListView` atau `CustomScrollView`.
3. Tambahkan komponen header halaman.
4. Tambahkan card-card utama (summary/status/info).
5. Tambahkan spacing konsisten (`SizedBox`).
6. Pindahkan bagian berulang ke file widget terpisah.

Template sederhana:

```dart
class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            DashboardHeader(),
            SizedBox(height: 16),
            DashboardSummaryCard(),
            SizedBox(height: 16),
            DashboardScheduleCard(),
          ],
        ),
      ),
    );
  }
}
```

## Kapan Harus Buat Widget Terpisah?

Pindahkan jadi widget terpisah jika:
- Komponen > 30-40 baris.
- Dipakai ulang di tempat lain.
- Membuat file page jadi sulit dibaca.

Contoh nama widget yang baik:
- `dashboard_header.dart`
- `status_chip.dart`
- `nutrition_progress_card.dart`
- `posyandu_schedule_card.dart`

## Aturan Styling Agar Konsisten

Pusatkan style di:
- `app_theme.dart`
- konstanta style lokal fitur (jika perlu)

Gunakan pola konsisten:
1. Radius card konsisten.
2. Elevation/shadow tipis dan seragam.
3. Jarak antar section konsisten (misal 12/16/20).
4. Hindari warna random per widget.

## Mapping UI Komponen Berdasarkan Fitur

### Dashboard
File utama:
- `lib/features/dashboard/presentation/pages/dashboard_page.dart`

Widget yang sebaiknya dibuat:
- `dashboard_header.dart`
- `dashboard_status_row.dart`
- `tip_harian_card.dart`
- `jadwal_terdekat_card.dart`

### Growth
File utama:
- `lib/features/growth/presentation/pages/growth_page.dart`

Widget yang sebaiknya dibuat:
- `growth_type_switch.dart`
- `growth_latest_measurement_card.dart`
- `growth_chart_card.dart`
- `growth_history_section.dart`

### Nutrition
File utama:
- `lib/features/nutrition/presentation/pages/nutrition_page.dart`

Widget yang sebaiknya dibuat:
- `nutrition_header_summary.dart`
- `nutrition_progress_card.dart`
- `meal_item_card.dart`

### Posyandu
File utama:
- `lib/features/posyandu/presentation/pages/posyandu_page.dart`

Widget yang sebaiknya dibuat:
- `immunization_status_card.dart`
- `upcoming_schedule_card.dart`
- `posyandu_action_button.dart`

### Quick Add
File utama:
- `lib/features/quick_add/presentation/pages/quick_add_page.dart`

Widget yang sebaiknya dibuat:
- `quick_add_option_tile.dart`
- `quick_add_sheet_header.dart`

## Checklist Selesai Tahap UI

- [ ] Semua page fitur utama bisa dibuka.
- [ ] Tidak ada error layout overflow.
- [ ] Struktur page bersih, widget sudah dipisah.
- [ ] Warna/spacing/typography konsisten.
- [ ] Komponen reusable dipindahkan ke `shared/widgets` bila perlu.

## Kesalahan Umum Pemula dan Cara Menghindarinya

1. Semua kode ditaruh di 1 file page.
Solusi: pecah jadi widget kecil per section.

2. Langsung campur API ke page.
Solusi: fokus UI statis dulu sampai beres.

3. Spacing tidak konsisten.
Solusi: tetapkan skala spacing (8, 12, 16, 20, 24).

4. Hardcoded warna di banyak file.
Solusi: taruh warna utama di theme.

## Setelah UI Selesai, Lanjut Ke Mana?

Urutan berikutnya:
1. Routing antar page.
2. State management (Cubit/Bloc).
3. Integrasi API.

Gunakan dokumen lanjutan:
- `docs/PANDUAN_PEMULA_BANGUN_APLIKASI.md`
- `docs/TUTORIAL_RUTE_PEMBANGUNAN_APLIKASI.md`

## Penutup

Kunci untuk pemula adalah membuat UI yang rapi dulu, baru masuk ke logic.
Kalau fondasi UI sudah baik, tahap routing, state, dan API akan jauh lebih mudah.
