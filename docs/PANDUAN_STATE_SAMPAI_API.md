# Panduan State Management Sampai Terhubung API

Dokumen ini fokus pada tahap setelah UI selesai, yaitu:
1. Konfigurasi state management (Cubit/Bloc).
2. Menyambungkan Cubit ke domain layer.
3. Menyambungkan domain ke data layer.
4. Menghubungkan data layer ke API nyata.

Dokumen ini memakai struktur folder yang sudah ada di project NalarGizi.

## 1. Gambaran Alur Data

Alur final yang harus tercapai:

`Page UI -> Cubit -> UseCase -> Repository (contract) -> RepositoryImpl -> RemoteDataSource -> API`

Data balik lewat jalur kebalikan sampai ditampilkan ke UI.

## 2. Urutan Kerja yang Disarankan

Kerjakan tiap fitur dengan urutan ini:
1. Rapikan `State` dan `Cubit`.
2. Hubungkan Cubit ke `UseCase`.
3. Rapikan `Entity`, `Repository contract`, `UseCase`.
4. Rapikan `Model`, `RemoteDataSource`, `RepositoryImpl`.
5. Integrasikan API dengan `Dio`.
6. Tangani loading/error/success di UI.
7. Tambahkan test minimal.

## 3. Struktur File yang Dikerjakan Per Fitur

Contoh fitur: `growth`

```text
lib/features/growth/
  data/
    datasources/growth_remote_data_source.dart
    models/growth_model.dart
    repositories/growth_repository_impl.dart
  domain/
    entities/growth_entity.dart
    repositories/growth_repository.dart
    usecases/get_growth_data_usecase.dart
  presentation/
    bloc/growth_state.dart
    bloc/growth_cubit.dart
    pages/growth_page.dart
```

## 4. Tahap A: Konfigurasi State (Cubit)

### 4.1 Definisikan state

Di `presentation/bloc/*_state.dart`, minimal punya:
- status (`initial`, `loading`, `success`, `failure`)
- data hasil
- message error

Contoh pola state:

```dart
enum GrowthStatus { initial, loading, success, failure }

class GrowthState {
  const GrowthState({
    this.status = GrowthStatus.initial,
    this.message = '',
    this.data,
  });

  final GrowthStatus status;
  final String message;
  final GrowthEntity? data;

  GrowthState copyWith({
    GrowthStatus? status,
    String? message,
    GrowthEntity? data,
  }) {
    return GrowthState(
      status: status ?? this.status,
      message: message ?? this.message,
      data: data ?? this.data,
    );
  }
}
```

### 4.2 Isi Cubit

Di `presentation/bloc/*_cubit.dart`, isi method `load()`:
1. emit loading
2. panggil usecase
3. emit success jika berhasil
4. emit failure jika error

Contoh pola:

```dart
class GrowthCubit extends Cubit<GrowthState> {
  GrowthCubit(this._getGrowthDataUseCase) : super(const GrowthState());

  final GetGrowthDataUseCase _getGrowthDataUseCase;

  Future<void> load() async {
    emit(state.copyWith(status: GrowthStatus.loading, message: ''));

    try {
      final result = await _getGrowthDataUseCase();
      emit(state.copyWith(status: GrowthStatus.success, data: result));
    } catch (e) {
      emit(state.copyWith(
        status: GrowthStatus.failure,
        message: e.toString(),
      ));
    }
  }
}
```

## 5. Tahap B: Hubungkan Domain Layer

### 5.1 Entity

`domain/entities/*_entity.dart` berisi model bisnis murni, tanpa kode JSON/API.

### 5.2 Repository Contract

`domain/repositories/*_repository.dart` mendefinisikan apa yang dibutuhkan Cubit/UseCase.

Contoh:

```dart
abstract class GrowthRepository {
  Future<GrowthEntity> getGrowthData();
}
```

### 5.3 UseCase

`domain/usecases/get_*_data_usecase.dart` memanggil repository contract.

Contoh:

```dart
class GetGrowthDataUseCase {
  const GetGrowthDataUseCase(this._repository);

  final GrowthRepository _repository;

  Future<GrowthEntity> call() {
    return _repository.getGrowthData();
  }
}
```

## 6. Tahap C: Hubungkan Data Layer

### 6.1 Model

`data/models/*_model.dart` bertugas map JSON <-> object.

Minimal punya:
- `fromMap` / `fromJson`
- `toMap` / `toJson`

### 6.2 RemoteDataSource

`data/datasources/*_remote_data_source.dart` melakukan HTTP request.

Contoh pola:

```dart
class GrowthRemoteDataSource {
  GrowthRemoteDataSource(this._dio);

  final Dio _dio;

  Future<GrowthModel> fetchGrowthData() async {
    final response = await _dio.get('/growth/latest');
    return GrowthModel.fromMap(response.data as Map<String, dynamic>);
  }
}
```

### 6.3 RepositoryImpl

`data/repositories/*_repository_impl.dart` implement contract domain.

Contoh pola:

```dart
class GrowthRepositoryImpl implements GrowthRepository {
  const GrowthRepositoryImpl(this._remoteDataSource);

  final GrowthRemoteDataSource _remoteDataSource;

  @override
  Future<GrowthEntity> getGrowthData() {
    return _remoteDataSource.fetchGrowthData();
  }
}
```

## 7. Tahap D: Setup API Client di Core

Buat setup network reusable di `lib/core/network`.

Minimal isi:
1. `api_client.dart` (instansiasi Dio)
2. `api_endpoints.dart` (konstanta endpoint)
3. `network_exception.dart` (mapping error)

Contoh kebutuhan konfigurasi Dio:
- `baseUrl`
- timeout
- default headers
- interceptor logging
- interceptor auth token

## 8. Tahap E: Wiring Dependency (Manual atau DI)

Agar Cubit bisa menerima UseCase dan seterusnya, lakukan dependency wiring.

Pilihan:
1. Manual di satu tempat (misal saat membuat page).
2. DI container (`get_it` + `injectable`).

Urutan dependency contoh fitur `growth`:
1. `Dio`
2. `GrowthRemoteDataSource(dio)`
3. `GrowthRepositoryImpl(remoteDataSource)`
4. `GetGrowthDataUseCase(repository)`
5. `GrowthCubit(useCase)`

## 9. Tahap F: Tampilkan State di UI

Di `*_page.dart` gunakan kombinasi:
- `BlocProvider` untuk menyediakan cubit
- `BlocBuilder` untuk render state
- `BlocListener` untuk side effect

Contoh logika render sederhana:
- `loading` -> `CircularProgressIndicator`
- `failure` -> teks error + tombol retry
- `success` -> tampilkan data

## 10. Error Handling yang Harus Ada

Minimal tangani:
1. Timeout
2. No internet
3. HTTP status bukan 2xx
4. JSON tidak sesuai format

Prinsip:
- Jangan lempar error mentah ke UI.
- Ubah ke pesan yang mudah dipahami user.

## 11. Checklist Selesai 1 Fitur (State + API)

- [ ] Cubit punya state loading/success/failure
- [ ] Cubit memanggil usecase, bukan datasource langsung
- [ ] UseCase memanggil repository contract
- [ ] RepositoryImpl memanggil datasource
- [ ] Datasource memanggil endpoint API
- [ ] UI merender state dengan benar
- [ ] Error API tertangani tanpa crash
- [ ] Ada test minimal (unit/widget)

## 12. Strategi Implementasi Bertahap

Paling aman untuk pemula:
1. Gunakan mock di datasource dulu.
2. Pastikan state flow sudah benar di UI.
3. Baru ganti isi datasource ke API nyata.
4. Jalankan test ulang.

## 13. Template Eksekusi Harian

Satu sesi kerja (1-2 jam) bisa pakai pola ini:
1. 20 menit: rapikan state + cubit
2. 20 menit: rapikan usecase + repository contract
3. 20 menit: rapikan repository impl + datasource
4. 20 menit: render state di page
5. 20 menit: test manual di emulator

## 14. Langkah Lanjut Setelah Semua Fitur Terhubung API

1. Tambahkan pagination (jika ada list panjang).
2. Tambahkan cache lokal.
3. Tambahkan analytics event.
4. Tambahkan integration test flow utama.

## Penutup

Kunci tahap ini adalah disiplin memisahkan layer:
- UI hanya urus tampilan dan interaksi.
- Cubit hanya urus state.
- Domain urus aturan bisnis.
- Data urus komunikasi API.

Dengan pola ini, project lebih mudah dirawat dan kamu lebih mudah scale fitur berikutnya.
