# Panduan Pengujian API NalarGizi (Deployed)

Dokumen ini menyediakan daftar kasus uji (test cases) untuk menguji backend NestJS yang sudah dideploy ke Vercel:
`https://backend-nalargizi-git-production-zidniees-projects.vercel.app`

---

## 1. Uji Publik (Public Endpoint)
Memastikan server berjalan dan merespon dengan benar.

### **A. Health Check (Get Hello World)**
*   **Method**: `GET`
*   **URL**: `https://backend-nalargizi-git-production-zidniees-projects.vercel.app/`
*   **cURL**:
    ```bash
    curl -X GET https://backend-nalargizi-git-production-zidniees-projects.vercel.app/
    ```
*   **Expected Response (Status 200)**:
    ```text
    Hello World!
    ```

---

## 2. Fitur Autentikasi (Auth Endpoints)

### **A. Registrasi User Baru (Register)**
*   **Method**: `POST`
*   **URL**: `https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/auth/register`
*   **Headers**:
    *   `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "fullName": "Budi Santoso",
      "email": "budisantoso@example.com",
      "password": "password123",
      "phoneNumber": "081234567890"
    }
    ```
*   **cURL**:
    ```bash
    curl -X POST https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/auth/register \
      -H "Content-Type: application/json" \
      -d '{"fullName": "Budi Santoso", "email": "budisantoso@example.com", "password": "password123", "phoneNumber": "081234567890"}'
    ```

### **B. Login User (Login)**
*   **Method**: `POST`
*   **URL**: `https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/auth/login`
*   **Headers**:
    *   `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "email": "budisantoso@example.com",
      "password": "password123"
    }
    ```
*   **cURL**:
    ```bash
    curl -X POST https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "budisantoso@example.com", "password": "password123"}'
    ```
*   **Expected Response (Status 200)**:
    Mendapatkan `accessToken` (JWT) dan `refreshToken` untuk digunakan pada request berikutnya.

---

## 3. Fitur Terproteksi (Authenticated Endpoints)
> [!NOTE]
> Semua request di bawah ini memerlukan header Authorization:
> `Authorization: Bearer <ACCESS_TOKEN_HASIL_LOGIN>`

### **A. Get User Profile (Me)**
*   **Method**: `GET`
*   **URL**: `https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/auth/me`
*   **cURL**:
    ```bash
    curl -X GET https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/auth/me \
      -H "Authorization: Bearer <ACCESS_TOKEN>"
    ```

### **B. Tambah Profil Anak (Create Child)**
*   **Method**: `POST`
*   **URL**: `https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/children`
*   **Body (JSON)**:
    ```json
    {
      "id": "e2a9b31d-84fc-4809-b649-74d7df6dbba8",
      "fullName": "Rizky Santoso",
      "gender": "male",
      "dateOfBirth": "2024-05-20T00:00:00Z",
      "placeOfBirth": "Jakarta",
      "bloodType": "O",
      "notes": "Anak sehat dan aktif"
    }
    ```
*   **cURL**:
    ```bash
    curl -X POST https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/children \
      -H "Authorization: Bearer <ACCESS_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{"id": "e2a9b31d-84fc-4809-b649-74d7df6dbba8", "fullName": "Rizky Santoso", "gender": "male", "dateOfBirth": "2024-05-20T00:00:00Z", "placeOfBirth": "Jakarta", "bloodType": "O", "notes": "Anak sehat"}'
    ```

### **C. Ambil Daftar Anak (Get Children)**
*   **Method**: `GET`
*   **URL**: `https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/children`
*   **cURL**:
    ```bash
    curl -X GET https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/children \
      -H "Authorization: Bearer <ACCESS_TOKEN>"
    ```

---

## 4. Fitur Gemini AI Nutrition Analysis

### **A. Analisis Makanan dengan AI (AI Nutrition Analyze)**
*   **Method**: `POST`
*   **URL**: `https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/nutrition/analyze`
*   **Body (JSON)**:
    ```json
    {
      "text": "Saya sarapan bubur ayam satu porsi dan minum air putih 1 gelas"
    }
    ```
*   **cURL**:
    ```bash
    curl -X POST https://backend-nalargizi-git-production-zidniees-projects.vercel.app/api/v1/nutrition/analyze \
      -H "Authorization: Bearer <ACCESS_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{"text": "Saya sarapan bubur ayam satu porsi dan minum air putih 1 gelas"}'
    ```
*   **Expected Response (Status 200)**:
    Kembalian berupa estimasi nutrisi terstruktur (kalori, karbohidrat, protein, lemak, air) yang dianalisis oleh Gemini AI.
