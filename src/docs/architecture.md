## System Overview

The authentication subsystem follows a layered architecture:

Client Request
→ Middleware Layer
→ Controller Layer
→ Service Layer
→ Model Layer
→ Database
→ Response

## Request Lifecycle

1. Request enters Express app
2. Request ID middleware attaches unique ID
3. Logger middleware logs request metadata
4. Validation middleware validates input using Zod
5. Controller handles request
6. Service executes business logic
7. Model interacts with MongoDB
8. Response sent using ApiResponse
9. Errors handled by centralized error middleware

## Authentication Flow

### Registration Flow

User → Controller → Service → Hash Password → Store in DB → Generate JWT access token → Set HTTP-only secure cookie -> Send response

### Login Flow

User → Validate credentials → Compare password → Generate JWT access token → Set HTTP-only secure cookie -> Send response

### Protected Route Flow (/me)

Request → Cookie extraction → JWT verification → Attach user → Allow access

### Logout Flow

Clear HTTP-only cookie → End session

## Middleware Pipeline

The request passes through multiple middleware layers:

- Request ID Middleware → assigns unique request ID
- Logger Middleware → logs request/response
- Validation Middleware → validates request using Zod
- Auth Middleware → verifies JWT token
- Error Middleware → handles all application errors

## Folder Responsibilities

### controllers/

Handle HTTP request/response lifecycle

### services/

Contain business logic (authentication logic)

### models/

MongoDB schemas and database operations

### middlewares/

Request processing layers (auth, validation, logging, error handling)

### utils/

Reusable helpers (JWT, cookies, logger, error classes)

### config/

Environment and configuration management

### routes/

API route definitions

### validation/

Validate user input(auth)

### db/

Database connection(connectDB, disconnectDB)

## Error Handling Strategy

The system uses centralized error handling:

- AppError for operational errors
- Central error middleware for response formatting
- Validation errors handled by Zod middleware
- Unexpected errors treated as 500 internal server errors

## Security Design

- Passwords hashed using bcrypt
- JWT stored in HTTP-only cookies
- No token stored in localStorage
- Input validation using Zod
- Environment variable validation using schema
- Secure middleware-based route protection

## Data Flow

Client → Express → Middleware → Controller → Service → MongoDB → Response

## Design Decisions

- JWT stored in HTTP-only cookies for security
- Layered architecture for separation of concerns
- Zod used for request validation
- Centralized error handling for consistency
- Request ID used for traceability

## Why Service Layer Exists

The service layer isolates business logic from controllers.

Benefits:

- Keeps controllers thin
- Improves reusability
- Makes testing easier
- Separates HTTP concerns from business logic

## Express 5 Error Handling

Express 5 automatically forwards async errors to the error middleware.
Because of this, a custom asyncHandler wrapper is not required.

## Current Limitations

- No refresh token rotation
- No email verification
- No CSRF protection
- No rate limiting
- No RBAC system
- No session management
