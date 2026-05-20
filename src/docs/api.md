# API Documentation

## Base URL

```bash
/api/v1
```

## Content-Type

```bash
application/json
```

## Authentication Method

Authentication is handled using JWT tokens stored inside HTTP-only cookies.

---

# Authentication Flow

1. User registers or logs in
2. Server generates JWT access token
3. JWT stored inside HTTP-only cookie
4. Protected routes verify the token
5. Logout clears authentication cookie

---

# API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login existing user |
| POST | `/api/v1/auth/logout` | Logout authenticated user |
| GET | `/api/v1/me` | Get authenticated user information |
| GET | `/health` | Health check route |

---

# POST /api/v1/auth/register

## Description

Registers a new user account.

## Request Body

```json
{
  "name": "Sandip Roy",
  "email": "sandip@gmail.com",
  "password": "Sandip@123"
}
```

## Validation Rules

### Name
- Minimum 3 characters
- Maximum 50 characters

### Email
- Must be a valid email address

### Password
Must contain:
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character
- Minimum 8 characters

---

## Success Response

Status: `201 Created`

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "6a0c77346c5bffe2d5a24254",
    "name": "Sandip Roy",
    "email": "sandip@gmail.com"
  },
  "success": true,
  "meta": {},
  "requestId": "c941b93c-b58d-44ed-a3e3-1c314e25093c",
  "timestamp": "2026-05-19T14:44:05.131Z"
}
```

---

## Error Responses

### Validation Error

Status: `400 Bad Request`

```json
{
  "success": false,
  "message": "Invalid input",
  "statusCode": 400,
  "error": {
    "type": "AppError"
  },
  "requestId": "4ac960dc-0141-4850-8f11-e1efb6247804",
  "timestamp": "2026-05-19T14:47:07.294Z"
}
```

### Duplicate Email

Status: `409 Conflict`

```json
{
  "success": false,
  "message": "User already exists",
  "statusCode": 409,
  "error": {
    "type": "AppError"
  },
  "requestId": "5706a959-70c3-490f-96d6-7a0d669f9bf3",
  "timestamp": "2026-05-19T14:50:57.789Z"
}
```

---

# POST /api/v1/auth/login

## Description

Authenticates an existing user.

## Request Body

```json
{
  "email": "sandip@gmail.com",
  "password": "Sandip@123"
}
```

---

## Success Response

Status: `200 OK`

```json
{
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "id": "6a0c77346c5bffe2d5a24254",
    "email": "sandip@gmail.com"
  },
  "success": true,
  "meta": {},
  "requestId": "request-id",
  "timestamp": "2026-05-19T14:44:05.131Z"
}
```

---

## Error Responses

### Invalid Credentials

Status: `401 Unauthorized`

```json
{
  "success":false,
  "message":"Invalid credentials",
  "statusCode":401,"
  error":{
    "type":"AppError"
    },
  "timeStamp":"2026-05-20T04:23:16.145Z","requestId":"ed4bc9bb-43ac-4154-8062-4d24e4e774c3",
}
```

### Invalid input

Status: `400 Bad Request`

```json
{
  "success":false,
  "message":"Invalid input: expected string, received undefined",
  "statusCode":400,
  "error":{
    "type":"AppError"
    },
  "timeStamp":"2026-05-20T04:17:29.270Z","requestId":"a470ecd3-2810-4381-97b8-f277e71a3136",
}
```

### User Not Found

Status: `404 Not Found`

```json
{
  "success":false,
  "message":"User does not exist",
  "statusCode":404,
  "error":{
    "type":"AppError"
    },
  "timeStamp":"2026-05-20T04:25:11.651Z","requestId":"9079fe9e-eb5d-472e-a34f-263680dd6761",
}
```

---

# POST /api/v1/auth/logout

## Description

Logs out the authenticated user by clearing authentication cookies.

---

## Success Response

Status: `200 OK`

```json
{"statusCode":200,
"message":"Logged out successfully",
"data":null,
"success":true,
"meta":{},
"requestId":"489181be-ee69-4f2a-8b42-cfeaf74441fc",
"timestamp":"2026-05-20T04:31:49.226Z"
}
```

## Unauthorized request

Status: `401 Unauthorized request`

```json
{
  "success":false,
  "message":"Unauthorized request",
  "statusCode":401,
  "error":{
    "type":"AppError"
    },
  "timeStamp":"2026-05-20T04:27:17.285Z","requestId":"d1aba8bb-411f-4e7e-bd61-aafae8cd98ee",
}
```

---

# GET /api/v1/me

## Description

Returns authenticated user information.

## Protected Route

Requires valid JWT cookie.

---

## Success Response

Status: `200 OK`

```json
{
  "success":true,
  "data":{
    "id":"6a06ca2ecc5f776398a6d710",
    "email":"sandip@gmail.com"
    },
  "requestId":"4cde74f6-e41a-4ce9-95a2-b6059bc2de38"
}
```

---

## Unauthorized Response

Status: `401 Unauthorized`

```json
{
  "success":false,
  "message":"Unauthorized request",
  "statusCode":401,
  "error":{
    "type":"AppError"
    },
  "timeStamp":"2026-05-20T04:35:59.551Z","requestId":"10118394-20ce-42f7-a05f-26b9c5de1542",
}
```

---

# GET /health

## Description

Health check endpoint for monitoring server status.

---

## Success Response

Status: `200 OK`

```json
{
  "success":true,
  "server":"running",
  "database":"Connected"
}
```

---

# Standard Response Structure

## Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {},
  "requestId": "uuid",
  "timestamp": "ISO date"
}
```

## Error Response

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "error": {
    "type": "AppError"
  },
  "requestId": "uuid",
  "timestamp": "ISO date"
}
```

---

# Security Features

- Password hashing using bcrypt
- JWT authentication
- HTTP-only cookies
- Protected route middleware
- Zod request validation
- Environment variable validation
- Centralized error handling

---

# Testing

Integration testing implemented using:
- Jest
- Supertest

Covered scenarios:
- Registration
- Login
- Logout
- Protected routes
- Validation failures
- Duplicate users
- Unauthorized access

---

# Status Codes

| Status Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error |
| 401 | Unauthorized |
| 404 | Resource not found |
| 409 | Conflict |
| 500 | Internal server error |