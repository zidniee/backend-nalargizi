# NalarGizi Backend - API Documentation

This documentation provides comprehensive details for integrating with the NalarGizi Backend REST API. All endpoints are prefixed with `api/v1`.

## Base URL
* **Development/Local:** `http://localhost:3000/api/v1`

## Authentication
All secure endpoints require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 1. Authentication Module (`/auth`)

### Register
* **Route:** `POST /auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "fullName": "Budi Santoso",
    "email": "budi@example.com",
    "phoneNumber": "+628123456789",
    "password": "SecurePassword123!"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "user": {
        "id": "a67e4369-0268-45d2-a74c-4e881447bc2a",
        "fullName": "Budi Santoso",
        "email": "budi@example.com",
        "phoneNumber": "+628123456789",
        "role": "user",
        "status": "active"
      }
    }
  }
  ```

### Login
* **Route:** `POST /auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "budi@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "user": {
        "id": "a67e4369-0268-45d2-a74c-4e881447bc2a",
        "fullName": "Budi Santoso",
        "email": "budi@example.com",
        "role": "user"
      },
      "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
  ```

### Refresh Token
* **Route:** `POST /auth/refresh`
* **Access:** Authenticated (Requires valid Refresh Token)
* **Request Body:**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "accessToken": "new_access_token_here",
      "refreshToken": "new_refresh_token_here"
    }
  }
  ```

### Fetch Current Profile
* **Route:** `GET /auth/me`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "a67e4369-0268-45d2-a74c-4e881447bc2a",
      "fullName": "Budi Santoso",
      "email": "budi@example.com",
      "phoneNumber": "+628123456789",
      "role": "user",
      "status": "active"
    }
  }
  ```

### Logout
* **Route:** `POST /auth/logout`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "success": true
    }
  }
  ```

---

## 2. Children Module (`/children`)

### Create Child Profile
* **Route:** `POST /children`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "id": "b6a71e84-1845-4299-90b5-e6a881447bd1",
    "fullName": "Aris Santoso",
    "gender": "male",
    "dateOfBirth": "2025-01-01T00:00:00.000Z",
    "placeOfBirth": "Jakarta",
    "bloodType": "O",
    "photoUrl": "https://example.com/aris.jpg",
    "notes": "Lahir prematur 1 minggu"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "b6a71e84-1845-4299-90b5-e6a881447bd1",
      "fullName": "Aris Santoso",
      "gender": "male",
      "dateOfBirth": "2025-01-01T00:00:00.000Z",
      "userId": "a67e4369-0268-45d2-a74c-4e881447bc2a"
    }
  }
  ```

### List Children
* **Route:** `GET /children`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": [
      {
        "id": "b6a71e84-1845-4299-90b5-e6a881447bd1",
        "fullName": "Aris Santoso",
        "gender": "male",
        "dateOfBirth": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### Get Child by ID
* **Route:** `GET /children/:id`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "b6a71e84-1845-4299-90b5-e6a881447bd1",
      "fullName": "Aris Santoso",
      "gender": "male",
      "dateOfBirth": "2025-01-01T00:00:00.000Z",
      "placeOfBirth": "Jakarta",
      "bloodType": "O",
      "photoUrl": "https://example.com/aris.jpg",
      "notes": "Lahir prematur 1 minggu"
    }
  }
  ```

### Update Child
* **Route:** `PATCH /children/:id`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "fullName": "Aris Santoso Pratama"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "b6a71e84-1845-4299-90b5-e6a881447bd1",
      "fullName": "Aris Santoso Pratama"
    }
  }
  ```

### Delete Child (Soft Delete)
* **Route:** `DELETE /children/:id`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "b6a71e84-1845-4299-90b5-e6a881447bd1",
      "deletedAt": "2026-05-20T08:00:00.000Z"
    }
  }
  ```

---

## 3. Growth Module (`/children/:childId/growth-records`)

### Create Growth Record (Z-Score Auto-Calculated)
* **Route:** `POST /children/:childId/growth-records`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "id": "c7b82f95-2956-53aa-01c6-f7b881447be2",
    "measuredAt": "2026-05-01T00:00:00.000Z",
    "weightKg": 11.2,
    "heightCm": 82.0,
    "headCircumferenceCm": 45.5,
    "source": "manual",
    "notes": "Pengukuran rutin bulanan"
  }
  ```
* **Success Response (201 Created):**
  * *Note: Z-scores are automatically lookup calculated based on standard WHO growth curve reference tables.*
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "c7b82f95-2956-53aa-01c6-f7b881447be2",
      "measuredAt": "2026-05-01T00:00:00.000Z",
      "weightKg": 11.2,
      "heightCm": 82.0,
      "headCircumferenceCm": 45.5,
      "zScoreWeight": 0.0,
      "zScoreHeight": 0.0,
      "zScoreBmi": 0.0
    }
  }
  ```

### List Growth Records
* **Route:** `GET /children/:childId/growth-records`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": [
      {
        "id": "c7b82f95-2956-53aa-01c6-f7b881447be2",
        "measuredAt": "2026-05-01T00:00:00.000Z",
        "weightKg": 11.2,
        "heightCm": 82.0,
        "zScoreWeight": 0.0,
        "zScoreHeight": 0.0
      }
    ]
  }
  ```

### Query WHO Growth Standard Boundaries
* **Route:** `GET /growth-standards`
* **Access:** Authenticated
* **Query Parameters:**
  * `gender`: `male` | `female`
  * `metric`: `weight` | `height` | `bmi` | `head`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": [
      {
        "ageMonths": 0,
        "sd3neg": 2.1,
        "sd2neg": 2.5,
        "sd1neg": 2.9,
        "median": 3.3,
        "sd1": 3.9,
        "sd2": 4.4,
        "sd3": 5.0
      }
    ]
  }
  ```

---

## 4. Nutrition Module (`/children/:childId/nutrition-journals`)

### Create Nutrition Journal
* **Route:** `POST /children/:childId/nutrition-journals`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "id": "d8c93a06-3a67-64bb-12d7-a8b991447bf3",
    "journalDate": "2026-05-20T00:00:00.000Z",
    "notes": "Jurnal makan hari ini"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "d8c93a06-3a67-64bb-12d7-a8b991447bf3",
      "journalDate": "2026-05-20T00:00:00.000Z"
    }
  }
  ```

### List Nutrition Journals
* **Route:** `GET /children/:childId/nutrition-journals`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": [
      {
        "id": "d8c93a06-3a67-64bb-12d7-a8b991447bf3",
        "journalDate": "2026-05-20T00:00:00.000Z",
        "meals": []
      }
    ]
  }
  ```

### Add Meal Log
* **Route:** `POST /nutrition-journals/:journalId/meals`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "id": "e9da4b17-4b78-75cc-23e8-b9ca02447c04",
    "mealType": "breakfast",
    "title": "Bubur Ayam",
    "subtitle": "Bubur wortel dan cincang ayam",
    "calories": 250,
    "portion": "1 mangkok",
    "statusLabel": "Habis",
    "statusColor": "green"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "e9da4b17-4b78-75cc-23e8-b9ca02447c04",
      "title": "Bubur Ayam"
    }
  }
  ```

### Update Meal Log
* **Route:** `PATCH /nutrition-meals/:mealId`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "title": "Bubur Ayam Spesial"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "e9da4b17-4b78-75cc-23e8-b9ca02447c04",
      "title": "Bubur Ayam Spesial"
    }
  }
  ```

### Delete Meal Log
* **Route:** `DELETE /nutrition-meals/:mealId`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "e9da4b17-4b78-75cc-23e8-b9ca02447c04",
      "deletedAt": "2026-05-20T08:00:00.000Z"
    }
  }
  ```

### Create Hydration Log
* **Route:** `POST /children/:childId/hydration-logs`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "id": "faeb5c28-5c89-86dd-34f9-cadb13558d15",
    "logDate": "2026-05-20T08:00:00.000Z",
    "cupsTarget": 8,
    "cupsConsumed": 4,
    "unit": "cups",
    "notes": "Pagi 2 gelas, siang 2 gelas"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "faeb5c28-5c89-86dd-34f9-cadb13558d15"
    }
  }
  ```

### Fetch Today's Hydration Logs
* **Route:** `GET /children/:childId/hydration-logs/today`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "faeb5c28-5c89-86dd-34f9-cadb13558d15",
      "cupsTarget": 8,
      "cupsConsumed": 4,
      "unit": "cups"
    }
  }
  ```

### AI Nutrition Analyzer (Gemini AI integration)
* **Route:** `POST /nutrition/analyze`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "text": "Makan nasi goreng telur dadar satu piring"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "title": "Nasi Goreng Telur Dadar",
      "calories": 450,
      "portion": "1 porsi",
      "proteinG": 12.0,
      "carbG": 55.0,
      "fatG": 18.0,
      "waterMl": 150,
      "confidenceScore": 0.95
    }
  }
  ```

---

## 5. Posyandu & Immunization Module

### Create Posyandu Schedule
* **Route:** `POST /children/:childId/posyandu-schedules`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "id": "0bfa6d39-6d9a-97ee-45fa-daec24669e26",
    "title": "Timbang Rutin Mei",
    "category": "Timbang",
    "location": "Posyandu Melati",
    "scheduledAt": "2026-05-25T09:00:00.000Z",
    "note": "Bawa buku KMS"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "0bfa6d39-6d9a-97ee-45fa-daec24669e26"
    }
  }
  ```

### Complete Posyandu Schedule
* **Route:** `PATCH /posyandu-schedules/:id/complete`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "completedAt": "2026-05-25T10:00:00.000Z"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "0bfa6d39-6d9a-97ee-45fa-daec24669e26",
      "isCompleted": true,
      "completedAt": "2026-05-25T10:00:00.000Z"
    }
  }
  ```

### Fetch Posyandu Overview
* **Route:** `GET /posyandu/overview`
* **Access:** Authenticated
* **Query Parameters:**
  * `childId`: `uuid`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "immunizationStatus": [
        {
          "id": "1cfb7e4a-7eab-a8ff-56fb-ebfd35770f37",
          "vaccineName": "BCG",
          "code": "BCG",
          "status": "done",
          "givenAt": "2026-05-20T00:00:00.000Z",
          "facilityName": "Puskesmas Melati"
        }
      ],
      "upcomingSchedules": [],
      "completedSchedules": [
        {
          "id": "0bfa6d39-6d9a-97ee-45fa-daec24669e26",
          "title": "Timbang Rutin Mei",
          "isCompleted": true
        }
      ]
    }
  }
  ```

### Log Immunization Record
* **Route:** `POST /children/:childId/immunization-records`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "id": "1cfb7e4a-7eab-a8ff-56fb-ebfd35770f37",
    "immunizationDefinitionId": "2d0c8f5b-8fbc-b9ff-67fc-fcfe46881f48",
    "givenAt": "2026-05-20T00:00:00.000Z",
    "status": "done",
    "facilityName": "Puskesmas Melati",
    "batchNumber": "VAKSIN-BCG-002",
    "note": "Kondisi anak normal"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "id": "1cfb7e4a-7eab-a8ff-56fb-ebfd35770f37"
    }
  }
  ```

---

## 6. Offline Synchronization Module (`/sync`)

Processes multiple create, update, and soft-delete logs logged offline on the Flutter mobile client in a single transactional dispatch.

* **Route:** `POST /sync`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "lastSyncedAt": "2026-05-19T00:00:00.000Z",
    "operations": [
      {
        "action": "create",
        "type": "growth",
        "clientUniqueId": "c7b82f95-2956-53aa-01c6-f7b881447be2",
        "data": {
          "childId": "b6a71e84-1845-4299-90b5-e6a881447bd1",
          "measuredAt": "2026-05-20T08:00:00.000Z",
          "weightKg": 12.0,
          "heightCm": 84.0,
          "headCircumferenceCm": 46.0,
          "notes": "Offline log timbang"
        }
      }
    ]
  }
  ```

### Success Response (200 OK - No Conflicts):
```json
{
  "success": true,
  "message": "Sync completed successfully",
  "data": {
    "hasConflicts": false,
    "results": [
      {
        "clientUniqueId": "c7b82f95-2956-53aa-01c6-f7b881447be2",
        "status": "synced"
      }
    ]
  }
}
```

### Conflict Response (200 OK - With Conflicts):
* *Note: Occurs when an incoming update request payload has a lastModifiedAt timestamp that is older than the current lastModifiedAt timestamp on the server.*
```json
{
  "success": false,
  "message": "Sync completed with conflicts",
  "data": {
    "hasConflicts": true,
    "results": [
      {
        "clientUniqueId": "c7b82f95-2956-53aa-01c6-f7b881447be2",
        "status": "conflict",
        "errorMessage": "Conflict: record on server has a newer modification timestamp",
        "serverData": {
          "id": "c7b82f95-2956-53aa-01c6-f7b881447be2",
          "weightKg": 12.5,
          "lastModifiedAt": "2026-05-20T08:30:00.000Z"
        }
      }
    ]
  }
}
```
