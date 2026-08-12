# Authentication Flow

This document describes how authentication requests move through the Authentication Subsystem, from the initial HTTP request to the final response.

The subsystem follows a layered request-processing model:

```text
Client
  ↓
Rate Limiter
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Database / Redis / External Service
  ↓
Controller
  ↓
API Response
```

Authentication-related routes may also contain authentication and authorization middleware before reaching the controller.

---

## 1. Application Startup Flow

Before the application starts accepting requests, the subsystem initializes its required infrastructure.

```text
server.js
   ↓
Bootstrap Phase
   ├── MongoDB connection
   ├── Redis connection
   └── Optional mail infrastructure
   ↓
Application Composition
   ├── Rate limiters
   └── Routers
   ↓
Application Creation
   ├── Global middleware
   ├── Routes
   └── Error middleware
   ↓
Server starts listening
```

### Bootstrap Phase

The bootstrap layer is responsible for establishing the prerequisites required by the application.

Critical infrastructure includes:

* MongoDB
* Redis

Mail infrastructure is treated separately because it is an optional external service.

This separation keeps `server.js` focused on starting and shutting down the HTTP server while the bootstrap layer handles infrastructure initialization.

### Application Composition

After the required infrastructure is initialized, the application is composed.

The composition layer creates:

* Authentication rate limiters
* Authentication router
* User router

The resulting application is passed back to the server.

The running server is therefore an instance of the Express application created by the composition process.

---

# 2. User Registration Flow

Registration is intentionally split into two stages:

1. Request registration and email verification code generation
2. Email verification and actual user creation

This prevents an unverified email address from immediately creating an authenticated account.

## Stage 1: Registration Request

The client sends:

```http
POST /api/v1/auth/register
```

with:

```json
{
  "name": "Sandip Roy",
  "email": "sandip@example.com",
  "password": "Example@123"
}
```

The request follows this flow:

```text
Client
  ↓
Rate Limiter
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
MongoDB
  ↓
Redis
  ↓
Email Service
  ↓
Controller
  ↓
Response
```

### 1. Rate Limiting

The registration rate limiter checks whether the client has exceeded the allowed number of registration requests.

This helps prevent:

* Automated registration abuse
* Excessive email generation
* Resource exhaustion

### 2. Request Validation

The validation middleware validates:

* Name
* Email
* Password

Zod is used to enforce the request schema before the request reaches the business logic.

### 3. Controller

The controller extracts the validated credentials and passes them to the appropriate service.

The controller is responsible for coordinating the HTTP request and response rather than implementing the registration business logic.

### 4. Service

The authentication service performs the registration logic.

It first checks whether the user already exists.

If the user already exists, the request is rejected.

If the user does not exist, the subsystem generates an email verification OTP.

### 5. Redis Storage

The generated OTP and relevant temporary registration information are stored in Redis.

Redis is used because the information is temporary and requires expiration.

For example:

```text
email-verification:<email>
email-verification-cooldown:<email>
```

The stored data automatically expires after its configured lifetime.

### 6. Verification Email

The OTP is sent to the user's email address through the mail infrastructure.

The user then receives the OTP and submits it through the verification endpoint.

---

# 3. Email Verification Flow

The client sends:

```http
POST /api/v1/auth/verify-email
```

with:

```json
{
  "email": "sandip@example.com",
  "otp": "123456"
}
```

The request follows:

```text
Client
  ↓
Rate Limiter
  ↓
Validation
  ↓
Controller
  ↓
Verification Service
  ↓
Redis
  ↓
MongoDB
  ↓
Session Creation
  ↓
Controller
  ↓
Response
```

### OTP Verification

The service retrieves the temporary registration information and OTP from Redis.

The submitted OTP is verified.

If verification fails, the registration process is rejected.

If verification succeeds:

1. Temporary verification data is removed from Redis.
2. The user is created in MongoDB.
3. A session is created.
4. Access and refresh tokens are generated.
5. The refresh token is stored.
6. Authentication cookies are configured.
7. The authenticated user response is returned.

The temporary OTP data is therefore removed after successful verification instead of remaining in Redis indefinitely.

---

# 4. Session Creation

After successful registration or login, the subsystem creates an authenticated session.

The session-related logic is implemented through utility functions such as:

```text
createSession.util.js
generateTokens.util.js
saveRefreshToken.util.js
cookie.util.js
```

These utilities are not separate architectural layers like controllers or services.

They provide reusable implementation-level operations used by the service layer.

A session contains:

* Access token
* Refresh token
* Token identifier (`jti`)
* User information required by the authentication system
* Expiration information

---

# 5. Access Token and Refresh Token Flow

The subsystem uses two different JWT tokens.

```text
                    Authentication Session
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
       Access Token                Refresh Token
       Short-lived                  Long-lived
       Request-based                Cookie-based
             ↓                           ↓
     Access protected             Generate new
         resources                  token pair
```

## Access Token

The access token is short-lived.

It contains authentication information such as:

* User ID
* User name
* Email
* Role
* Expiration time
* JWT ID (`jti`)

The client sends the access token when accessing protected resources.

The token is generally provided through the request's authorization header.

Example:

```http
Authorization: Bearer <access-token>
```

## Refresh Token

The refresh token is long-lived compared with the access token.

It is stored:

* In an HTTP cookie on the client side
* In the user's MongoDB document on the server side

The refresh token is used to obtain a new access token without requiring the user to log in again.

---

# 6. Accessing a Protected Resource

Consider the following endpoint:

```http
GET /api/v1/me
```

A user must already be authenticated to access this endpoint.

The request follows:

```text
Client
  ↓
Verify Access Token Middleware
  ↓
Check Token Blacklist
  ↓
Decode JWT
  ↓
Attach User Information to Request
  ↓
Controller
  ↓
Service
  ↓
Response
```

## Verify Access Token Middleware

The middleware first retrieves the access token from the request.

The token is verified and decoded.

The subsystem also checks whether the token's `jti` exists in Redis as a revoked token.

Conceptually:

```text
blacklist:<jti>
```

If the token is found in the blacklist, the request is rejected.

For example:

```text
Token exists in blacklist
        ↓
"Token revoked"
        ↓
HTTP 401
```

If the token is valid, the decoded information is attached to the request.

For example:

```javascript
req.user = decodedToken;
```

The request can then continue to the next layer.

---

# 7. Why Access Tokens Are Short-Lived

Access tokens are intentionally short-lived.

If an access token is compromised, an attacker can potentially use it until it expires.

A short expiration period limits the lifetime of that compromised credential.

The refresh token allows the legitimate user to continuously obtain new access tokens without repeatedly entering their password.

This creates the following security model:

```text
Login
  ↓
Access Token ───────────────→ Short lifetime
  ↓
Expires
  ↓
Refresh Token
  ↓
New Access Token + New Refresh Token
```

The goal is to minimize the lifetime of a compromised access token while maintaining a convenient authenticated session for the legitimate user.

---

# 8. Refresh Token Flow

When an access token expires, the client uses:

```http
POST /api/v1/auth/refresh-token
```

The request follows:

```text
Client
  ↓
Refresh Token Middleware
  ↓
Read Refresh Token from Cookie
  ↓
Verify JWT
  ↓
Find User
  ↓
Compare Refresh Token
  ↓
Attach Token Payload to Request
  ↓
Controller
  ↓
Service
  ↓
Generate New Token Pair
  ↓
Store New Refresh Token
  ↓
Set New Cookie
  ↓
Response
```

## Step 1: Retrieve Refresh Token

The refresh token is retrieved from the authentication cookie.

## Step 2: Verify Token

The refresh token JWT is verified.

An expired or invalid refresh token cannot be used to create another session.

## Step 3: Verify User

The user associated with the refresh token is checked against MongoDB.

## Step 4: Compare Stored Refresh Token

The incoming refresh token is compared with the refresh token currently stored for the user.

This provides server-side control over the refresh session.

## Step 5: Rotate Tokens

If the refresh token is valid, the subsystem generates:

* A new access token
* A new refresh token

The new refresh token replaces the previous stored refresh token.

The new refresh token is also returned through the authentication cookie.

This is refresh-token rotation.

---

# 9. Refresh Token Expiration

A refresh token is longer-lived than an access token, but it is not permanent.

If the refresh token expires:

```text
Expired Refresh Token
        ↓
Verification Middleware
        ↓
Request rejected
        ↓
User must authenticate again
```

An expired refresh token cannot be used to generate another access/refresh token pair.

This prevents an indefinitely reusable authentication credential.

However, a refresh token that is stolen while still valid remains a security risk until it expires or is invalidated.

---

# 10. Logout Flow

The logout endpoint is:

```http
POST /api/v1/auth/logout
```

The request first passes through access-token verification.

```text
Client
  ↓
Verify Access Token
  ↓
Logout Controller
  ↓
Logout Service
  ├── Remove Refresh Token
  ├── Blacklist Access Token
  └── Clear Authentication Cookies
  ↓
Response
```

## Refresh Token Invalidation

During logout, the stored refresh token is removed from the user's MongoDB document.

Conceptually:

```javascript
$unset: {
  refreshToken: 1
}
```

This prevents the existing refresh token from being used to create a new token pair.

## Access Token Blacklisting

The access token itself is stateless, so simply deleting the refresh token does not immediately invalidate an already-issued access token.

Therefore, the access token's `jti` is added to Redis:

```text
blacklist:<jti> = revoked
```

The Redis entry uses the remaining lifetime of the access token as its expiration time.

Therefore, the blacklist entry automatically disappears when the token would have expired anyway.

## Clearing Cookies

The authentication cookies are cleared from the client during logout.

This removes the browser's stored refresh-token cookie.

The combination of:

* Removing the stored refresh token
* Blacklisting the access token
* Clearing authentication cookies

provides a complete logout flow.

---

# 11. Password Reset Flow

The password recovery process is divided into two stages.

## Request Password Reset

The client sends:

```http
POST /api/v1/auth/forgot-password
```

The request passes through:

```text
Rate Limiter
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Generate OTP
  ↓
Redis
  ↓
Email
```

A password reset OTP is generated and temporarily stored in Redis.

The OTP is then sent to the user's email address.

## Reset Password

The client sends:

```http
POST /api/v1/auth/reset-password
```

with:

```json
{
  "email": "sandip@example.com",
  "otp": "123456",
  "password": "NewPassword@123"
}
```

The request follows:

```text
Rate Limiter
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Redis OTP Verification
  ↓
Password Update in MongoDB
  ↓
Response
```

After successful verification, the user's password is updated.

The temporary OTP information is removed or allowed to expire according to the configured Redis lifecycle.

---

# 12. Google Authentication Flow

The subsystem also supports authentication through Google.

The endpoint is:

```http
POST /api/v1/auth/google
```

The client provides a Google ID token.

```text
Client
  ↓
Rate Limiter
  ↓
Validation
  ↓
Controller
  ↓
Google Authentication Service
  ↓
Google Token Verification
  ↓
MongoDB
  ↓
Session Creation
  ↓
Access + Refresh Tokens
  ↓
Response
```

The subsystem verifies the Google ID token using Google's authentication infrastructure.

After successful verification, the subsystem identifies or creates the corresponding user and creates an application session.

The application's own access and refresh tokens are still used after Google authentication.

Google therefore acts as the identity provider while the subsystem maintains its own application-level authentication session.

---

# 13. Authorization Flow

Authentication and authorization are separate concerns.

Authentication answers:

> "Who is this user?"

Authorization answers:

> "Is this authenticated user allowed to perform this operation?"

For example, administrative operations use:

```text
Verify Access Token
        ↓
Authorize("admin")
        ↓
Controller
```

The access token provides the user's role.

The authorization middleware checks that role before allowing the request to continue.

For example:

```text
User Role = user
        ↓
Admin Endpoint
        ↓
Authorization denied
        ↓
403 Forbidden
```

An administrator can access administrative endpoints because their authenticated identity contains the required role.

---

# 14. Admin Registration Flow

Normal registration creates a regular user.

Administrative registration is protected:

```http
POST /api/v1/auth/admin/register
```

The request follows:

```text
Client
  ↓
Access Token Verification
  ↓
Admin Authorization
  ↓
Admin Rate Limiter
  ↓
Validation
  ↓
Controller
  ↓
Service
```

Only an authenticated administrator can initiate this operation.

The requested role is assigned by the route rather than being accepted directly from the public registration request.

This prevents a public user from simply submitting:

```json
{
  "role": "admin"
}
```

to obtain administrative privileges.

---

# 15. User Management Flow

Administrative user-management endpoints follow the same authentication and authorization pattern.

For example:

```http
GET /api/v1/users
DELETE /api/v1/users/:userId
PATCH /api/v1/users/:userId/role
```

The request passes through:

```text
Access Token Verification
        ↓
Admin Authorization
        ↓
Rate Limiter
        ↓
Validation (when required)
        ↓
Controller
        ↓
User Service
        ↓
MongoDB
        ↓
Response
```

Additional business rules are enforced in the controller/service flow.

For example, an administrator cannot:

* Delete their own account
* Change their own role

This prevents an administrator from accidentally or intentionally removing their own administrative access through these endpoints.

---

# 16. Error Handling Flow

Errors from controllers, services, middleware, or infrastructure eventually reach the global error middleware.

```text
Request
  ↓
Any Application Layer
  ↓
Error
  ↓
Global Error Middleware
  ↓
Logger
  ↓
Consistent API Error Response
```

The error middleware:

* Determines the HTTP status code
* Logs the error
* Includes the request ID
* Hides internal error details in production
* Returns the application's standard error structure

In development, the stack trace may also be returned to assist debugging.

---

# 17. Request ID Flow

Every request receives a request ID through the request ID middleware.

```text
Incoming Request
      ↓
Request ID Middleware
      ↓
req.requestId
      ↓
Controllers / Services / Logs
      ↓
API Response
```

The request ID allows an individual request to be correlated across application logs and API responses.

For example:

```json
{
  "success": true,
  "requestId": "req_abc123"
}
```

If an error occurs, the same request ID can be used to locate the corresponding server-side log entry.

---

# 18. Overall Authentication Architecture

The major authentication flows can be summarized as:

```text
                         ┌─────────────────────┐
                         │       Client        │
                         └──────────┬──────────┘
                                    │
                                    ↓
                         ┌─────────────────────┐
                         │    Rate Limiter     │
                         └──────────┬──────────┘
                                    │
                                    ↓
                         ┌─────────────────────┐
                         │     Validation      │
                         └──────────┬──────────┘
                                    │
                                    ↓
                         ┌─────────────────────┐
                         │     Controller      │
                         └──────────┬──────────┘
                                    │
                                    ↓
                         ┌─────────────────────┐
                         │      Service       │
                         └──────┬──────┬──────┘
                                │      │
                    ┌───────────┘      └────────────┐
                    ↓                              ↓
             ┌──────────────┐               ┌──────────────┐
             │   MongoDB    │               │    Redis     │
             │ Persistent   │               │ Temporary    │
             │    Data      │               │    Data      │
             └──────────────┘               └──────────────┘
                                │
                                ↓
                         ┌─────────────────────┐
                         │     Controller      │
                         └──────────┬──────────┘
                                    │
                                    ↓
                         ┌─────────────────────┐
                         │   API Response      │
                         └─────────────────────┘
```

The authentication subsystem therefore separates:

* HTTP concerns into controllers and routes
* Business logic into services
* Authentication checks into middleware
* Validation into schemas
* Persistent data into MongoDB
* Temporary data into Redis
* External authentication into Google
* Email delivery into the mail infrastructure
* Reusable implementation details into utilities

This separation allows the authentication subsystem to be developed, tested, secured, and improved independently from the main application that consumes it.