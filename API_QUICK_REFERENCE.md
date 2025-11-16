# ZoctorAI API Quick Reference

**Base URL:** `https://zaidi123.pythonanywhere.com`  
**Local:** `http://localhost:8000`

## Authentication

All authenticated endpoints require: `Authorization: Bearer <access_token>`

---

## 🔐 Authentication Endpoints

### Signup
```http
POST /api/users/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:** Returns `session_id` for OTP verification

---

### Login
```http
POST /api/users/auth/login
Content-Type: application/json

{
  "identifier": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Returns JWT tokens if user is verified, otherwise requires OTP

---

### Send OTP
```http
POST /api/users/auth/send-otp
Content-Type: application/json

{
  "identifier": "user@example.com"
}
```

**Note:** 15-second cooldown between requests

---

### Verify OTP
```http
POST /api/users/auth/verify-otp
Content-Type: application/json

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "123456"
}
```

**Response:** Returns JWT tokens and marks user as verified

---

### Refresh Token
```http
POST /api/users/auth/refresh
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** New access token

---

### Get Current User
```http
GET /api/users/auth/me
Authorization: Bearer <access_token>
```

---

### Update Profile
```http
PATCH /api/users/auth/update
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Jane",
  "phone": "+1987654321"
}
```

---

### Logout
```http
POST /api/users/auth/logout
Authorization: Bearer <access_token>
```

---

## 📄 Document Endpoints

### Upload Document
```http
POST /api/documents/upload/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "filename": "medical_report.pdf",
  "data_base64": "JVBERi0xLjQKJeLjz9MKMy...",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Note:** File must be base64 encoded. Supports PDF, TXT, MD.

---

## 💬 Chat Endpoints

### Create Message
```http
POST /api/chat/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "What are the key findings?",
  "conversation_id": 1
}
```

**Response:** Returns `stream_id` for SSE streaming

---

### Stream Chat Response (SSE)
```http
GET /api/chat/stream/<stream_id>/?token=<access_token>
```

**JavaScript Example:**
```javascript
const eventSource = new EventSource(
  `/api/chat/stream/${streamId}/?token=${accessToken}`
);

eventSource.onmessage = (e) => {
  console.log('Word:', e.data);
};

eventSource.addEventListener('done', () => {
  eventSource.close();
  console.log('Stream complete');
});
```

---

## 📊 Summary Endpoints

### Generate Summary
```http
POST /api/summaries/generate/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "document_id": 1
}
```

---

## 🔍 Retrieval Endpoints

### Cost Lookup
```http
GET /api/retrieval/cost/?treatment=heart+surgery
Authorization: Bearer <access_token>
```

---

### Hospital Search
```http
GET /api/retrieval/hospitals/?q=cardiac+center&city=New+York
Authorization: Bearer <access_token>
```

---

## 📈 Telemetry Endpoints

### Log Funnel Event
```http
POST /api/telemetry/funnel/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "document_uploaded",
  "source": "web",
  "metadata": {
    "document_type": "pdf"
  }
}
```

---

## 🔑 Accounts Endpoints

### Ensure Session
```http
GET /api/accounts/session/?session_id=<uuid>
Authorization: Bearer <access_token>
```

---

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (OTP not verified)
- `404` - Not Found
- `429` - Too Many Requests (OTP cooldown)
- `500` - Internal Server Error
- `502` - Bad Gateway (external service error)

---

## Authentication Flow

### New User:
1. `POST /api/users/auth/signup` → Get `session_id`
2. `POST /api/users/auth/verify-otp` → Get JWT tokens
3. Use `access` token in `Authorization` header

### Existing User:
1. `POST /api/users/auth/login` → Get JWT tokens (if verified)
2. If not verified: `POST /api/users/auth/send-otp` → `POST /api/users/auth/verify-otp`

### Token Refresh:
- Access token expires in **60 minutes**
- Refresh token expires in **7 days**
- Use `POST /api/users/auth/refresh` before access token expires

---

## Important Notes

- **CORS:** Enabled for all origins
- **OTP Cooldown:** 15 seconds between requests
- **OTP Expiry:** 10 minutes (600 seconds)
- **OTP Max Attempts:** 5 per code
- **File Upload:** Must be base64 encoded
- **SSE Streaming:** Use EventSource API for chat responses

---

## TypeScript/JavaScript Client

See `API_TYPES.ts` for a ready-to-use TypeScript client class with all methods implemented.

