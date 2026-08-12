# Design Decisions

This document explains the major architectural and technical decisions made while designing the Authentication Subsystem and the reasoning behind them.

The goal was not simply to implement authentication features, but to build authentication as an independent subsystem that can be reused, tested, secured, and improved separately from future applications.

---

# 1. Authentication as a Separate Subsystem

The primary design decision was to separate authentication from the main application.

Instead of implementing authentication independently inside every future application, this project provides a dedicated authentication subsystem that can be reused across multiple applications.

The motivation is:

* Centralize authentication logic
* Avoid duplicating authentication implementations
* Improve the authentication system independently
* Apply security improvements in one place
* Make authentication easier to test
* Keep future application code focused on its own business domain

The subsystem is therefore designed as an independent system rather than as an authentication folder inside a single application.

Conceptually:

```text
                    Authentication Subsystem
                              │
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
         Project A         Project B        Project C
```

Each future application can consume the authentication capabilities without rebuilding the entire authentication system from scratch.

---

# 2. Layered Architecture

The application uses a layered architecture to separate responsibilities.

The major layers are:

```text
Routes
   ↓
Middleware
   ↓
Controllers
   ↓
Services
   ↓
Infrastructure / Database
```

Each layer has a specific responsibility.

### Routes

Routes define HTTP endpoints and determine which middleware and controller should handle a request.

### Middleware

Middleware handles cross-cutting request concerns such as:

* Authentication
* Authorization
* Rate limiting
* Validation
* Request IDs
* Logging
* Error handling

### Controllers

Controllers are responsible for handling HTTP concerns.

They:

1. Receive the request
2. Extract validated input
3. Call the appropriate service
4. Construct the HTTP response

Controllers do not contain the primary business logic.

### Services

Services contain the application's business logic.

For example, registration logic belongs to the authentication service rather than directly inside the route or controller.

### Infrastructure

Infrastructure handles communication with external systems such as:

* MongoDB
* Redis
* Email
* Google authentication

This separation makes the business logic less dependent on infrastructure implementation details.

---

# 3. Composition Root

Application composition is separated from application creation.

The composition layer is responsible for constructing the application's dependencies.

For example:

```text
createApplication()
    │
    ├── Create rate limiters
    ├── Create authentication router
    ├── Create user router
    │
    └── Create Express application
```

This was intentionally separated from `server.js`.

The server should primarily be responsible for:

* Starting the server
* Listening on a port
* Handling graceful shutdown

The composition layer is responsible for determining how the application is assembled.

This makes the application's dependencies explicit and makes testing easier because different dependencies can be provided when necessary.

---

# 4. Bootstrap Separation

Infrastructure initialization is separated from server startup.

The project uses bootstraps for prerequisites such as:

* MongoDB
* Redis
* Mail infrastructure

The reason for this separation is responsibility.

`server.js` represents the running HTTP server, while bootstraps prepare the environment required for that server to run.

Conceptually:

```text
Bootstrap
   ↓
Prerequisites ready
   ↓
Application composition
   ↓
Server startup
```

This prevents `server.js` from becoming responsible for database connection logic, Redis initialization, application construction, and HTTP server management simultaneously.

---

# 5. Critical and Optional Bootstraps

Infrastructure initialization is divided into critical and optional bootstraps.

### Critical Infrastructure

MongoDB and Redis are considered critical because the authentication subsystem depends on them.

If these services cannot be initialized, the application should not start normally.

### Optional Infrastructure

Mail infrastructure is separated as an optional bootstrap.

This allows infrastructure that is not required for every application startup scenario to be treated differently from core dependencies.

This distinction also provides a cleaner structure for future infrastructure additions.

---

# 6. MongoDB as the Primary Database

MongoDB was selected as the central persistent database.

The primary reasons were:

* Familiarity with the MERN stack
* Flexible document-based data model
* Good compatibility with Node.js
* Mature ecosystem
* Straightforward integration with Mongoose

Authentication data can evolve over time.

A document-oriented database provides flexibility when the user model needs additional fields or authentication-related information.

For example, the user document can contain:

```text
User
├── name
├── email
├── password
├── role
├── refreshToken
└── other authentication information
```

MongoDB is responsible for persistent user and authentication-session data.

---

# 7. Redis for Temporary Data

Redis was selected for temporary authentication data.

The subsystem uses Redis for information such as:

* Email verification OTPs
* Password reset OTPs
* OTP cooldown information
* Revoked access-token identifiers

Redis is an in-memory data store and is therefore very fast.

More importantly, Redis provides key expiration.

For example:

```text
email-verification:<email>
       ↓
temporary value
       ↓
automatic expiration
```

This makes Redis well suited for data that should exist only for a limited amount of time.

Instead of manually maintaining cleanup jobs for every temporary OTP, Redis can automatically remove expired keys.

---

# 8. JWT for Authentication Tokens

JWT was selected to implement access and refresh tokens.

The subsystem separates authentication into two token types:

* Access token
* Refresh token

The access token is short-lived and used for normal authenticated requests.

The refresh token is longer-lived and used to generate new access tokens.

This provides a balance between:

* Security
* User convenience
* Stateless request authentication

The access token contains authentication claims such as:

* User ID
* Email
* Name
* Role
* Expiration
* JWT ID

The JWT ID is particularly useful for token revocation because it provides a unique identifier for the token.

---

# 9. Short-Lived Access Tokens

Access tokens are intentionally short-lived.

The reasoning is simple:

> The shorter the lifetime of a compromised access token, the smaller the window in which it can be abused.

A compromised access token cannot be guaranteed to be harmless, but reducing its lifetime limits the attack window.

The refresh token allows the legitimate client to obtain a new access token without requiring the user to authenticate again.

---

# 10. Refresh Token Rotation

Refresh tokens are rotated when they are used.

The process is:

```text
Existing Refresh Token
        ↓
Validate
        ↓
Generate New Access Token
        +
Generate New Refresh Token
        ↓
Replace Stored Refresh Token
```

The previous refresh token is replaced by the new one.

This provides stronger control over refresh sessions than simply allowing the same long-lived refresh token to be reused indefinitely.

The refresh token stored in MongoDB also allows the server to verify whether the incoming refresh token is still the currently valid token for the user.

---

# 11. Refresh Token Storage

The refresh token is stored both:

* In a client-side authentication cookie
* In MongoDB

The cookie allows the browser/client to automatically send the refresh token.

The database copy gives the server control over the refresh session.

For example, during logout:

```text
Database refresh token
        ↓
Removed
        ↓
Existing refresh token becomes invalid
```

This provides server-side invalidation for an otherwise long-lived credential.

---

# 12. HTTP Cookies for Refresh Tokens

The refresh token is stored in an authentication cookie rather than being returned as ordinary response data for the client to manually manage.

This reduces unnecessary exposure of the refresh token to application-level JavaScript when configured with appropriate cookie security attributes.

The cookie mechanism also makes refresh-token requests convenient for browser-based clients.

The access token, on the other hand, is intended for authenticated API requests.

---

# 13. Access Token Blacklisting

JWT access tokens are normally stateless.

Once issued, the server does not need to store every access token.

However, this creates a problem during logout.

If an access token remains valid for several minutes after logout, simply deleting the refresh token does not immediately invalidate the access token.

To solve this, the subsystem uses Redis as a temporary blacklist.

```text
blacklist:<jti>
      ↓
revoked
      ↓
expires when the access token expires
```

The access token's `jti` is stored in Redis when the user logs out.

Every protected request checks whether the token's `jti` has been revoked.

This provides immediate access-token revocation while avoiding permanent storage of expired tokens.

---

# 14. Blacklist Expiration

Blacklist entries are not stored indefinitely.

When an access token is revoked, the remaining lifetime of the token is calculated.

The Redis blacklist entry uses that remaining lifetime as its expiration period.

Therefore:

```text
Access Token
    │
    ├── Valid → blacklist entry unnecessary
    │
    ├── Logout → add jti to Redis
    │
    └── Natural expiration → Redis entry automatically expires
```

This prevents the blacklist from growing permanently with old tokens.

---

# 15. Email Verification Before Account Creation

Registration is divided into:

```text
Registration Request
        ↓
OTP Verification
        ↓
User Creation
```

The user is not immediately persisted as a fully registered account when the registration request is first submitted.

Instead, temporary registration information is stored in Redis and an OTP is sent to the email address.

Only after successful verification is the user created in MongoDB.

This helps ensure that the registered email address is controlled by the person completing the registration.

---

# 16. OTP Storage in Redis

OTP data is temporary by nature.

Therefore, storing OTPs directly in MongoDB would introduce unnecessary persistent data that would need to be cleaned up.

Redis provides:

* Fast access
* Automatic expiration
* Temporary key-value storage

This makes it a better fit for verification and password-reset OTPs.

---

# 17. Zod for Validation

Zod is used for request and environment validation.

For HTTP requests, schemas define what the API accepts.

For example, registration requires:

```text
name
email
password
```

The validation layer prevents invalid input from reaching the business logic.

Zod is also used for environment configuration validation so that the application can detect invalid or missing configuration early.

This follows the principle:

> Validate input as early as possible.

---

# 18. Centralized Error Handling

The application uses a global error middleware instead of implementing error responses independently inside every controller.

The flow is:

```text
Error
  ↓
Global Error Middleware
  ↓
Log Error
  ↓
Build Consistent Response
  ↓
Client
```

This provides a consistent error structure throughout the API.

It also keeps controllers cleaner because they do not need to duplicate error-response formatting.

---

# 19. Custom AppError

A custom `AppError` class is used for operational application errors.

Instead of throwing generic errors with no HTTP context:

```javascript
throw new Error("Invalid credentials");
```

the application can throw:

```javascript
throw new AppError("Invalid credentials", 401);
```

This allows the global error middleware to determine the appropriate HTTP status code and response behavior.

The distinction between operational errors and unexpected internal errors also helps the application handle production errors more safely.

---

# 20. Consistent API Responses

The subsystem uses an `ApiResponse` utility to standardize successful responses.

Responses contain consistent fields such as:

```text
statusCode
message
data
success
meta
requestId
timestamp
```

The motivation is consistency.

A client consuming multiple endpoints should not need to understand a different response format for every endpoint.

---

# 21. Request IDs

Every request receives a request ID.

The request ID is:

* Added to the request
* Included in logs
* Returned in API responses

This creates a simple correlation mechanism.

For example:

```text
Client Request
     ↓
requestId = req_abc123
     ↓
Application Logs
     ↓
API Response
     ↓
requestId = req_abc123
```

When debugging a production issue, the request ID can be used to connect the client-visible error with the corresponding server-side logs.

---

# 22. Rate Limiting

Rate limiting is applied to authentication-sensitive operations.

Examples include:

* Registration
* Login
* OTP verification
* OTP resend
* Password reset
* Refresh token
* Google authentication
* Administrative operations

Authentication endpoints are attractive targets for automated abuse.

Rate limiting reduces the ability of an attacker to repeatedly:

* Attempt passwords
* Generate verification emails
* Generate password-reset emails
* Submit OTPs
* Abuse authentication resources

Different operations can have different rate limits according to their risk and expected usage.

---

# 23. Google Authentication

Google authentication was included because Google provides a widely used identity platform with strong authentication infrastructure.

The subsystem does not replace its own authentication session with the Google credential.

Instead:

```text
Google Identity
      ↓
Verify Google ID Token
      ↓
Identify Application User
      ↓
Create Application Session
      ↓
Application Access + Refresh Tokens
```

This keeps the subsystem's authorization and session-management model consistent regardless of whether the user authenticates using a password or Google.

---

# 24. Docker for Environment Isolation

Docker is used to isolate development and testing environments and to make deployment more predictable.

The project contains separate Docker configurations for different environments.

```text
Dockerfile
Dockerfile.dev
Dockerfile.test

docker-compose.yml
docker-compose.dev.yml
docker-compose.test.yml
```

The motivation is to reduce differences between environments.

A developer should not need to manually reproduce every infrastructure dependency on their machine.

Docker also makes it easier to run services such as MongoDB and Redis in isolated environments.

---

# 25. Separate Test Environment

Testing uses a separate environment from development.

The purpose is to prevent tests from accidentally modifying development data.

The test setup provides isolated infrastructure and configuration.

This allows integration tests to exercise real application behavior without relying on the developer's normal database state.

---

# 26. Unit and Integration Testing

The subsystem uses both unit and integration tests.

### Unit Tests

Unit tests focus on individual pieces of logic.

Examples include:

* Token generation
* Cookie utilities
* Access-token middleware
* API response utility
* Error middleware
* User model behavior

### Integration Tests

Integration tests verify complete request flows.

Examples include:

* Registration
* Email verification
* Login
* Logout
* Refresh-token rotation
* Password reset
* Google authentication
* Protected routes
* Rate limiting
* User management

The combination provides both isolated verification and end-to-end API behavior verification.

---

# 27. Email Service Abstraction

Email sending is separated from authentication business logic.

Authentication services determine **when** an email needs to be sent.

The mail infrastructure determines **how** the email is delivered.

For example:

```text
Authentication Service
        ↓
Email Utility
        ↓
Mail Transporter
        ↓
Email Provider
```

This keeps the authentication service from being tightly coupled to the email transport implementation.

---

# 28. Utilities Are Not Architectural Layers

Utility modules such as:

```text
createSession.util.js
generateTokens.util.js
cookie.util.js
saveRefreshToken.util.js
buildUserResponse.util.js
```

are not considered separate application layers.

They are reusable implementation units.

For example:

```text
Controller
    ↓
Service
    ↓
createSession()
    ↓
generateTokens()
    ↓
saveRefreshToken()
```

The service remains responsible for the business operation while utilities provide reusable low-level operations.

This distinction prevents the architecture from becoming unnecessarily complicated.

---

# 29. API Documentation with OpenAPI

The API is documented using OpenAPI.

The documentation is maintained separately from the main business logic and is organized into:

```text
src/docs/
├── openapi.js
├── components/
└── paths/
```

The documentation is divided into reusable components and endpoint definitions.

This makes a large OpenAPI specification easier to maintain than keeping the entire specification in a single large file.

Swagger UI provides an interactive interface for exploring and testing the documented API.

---

# 30. Separation Between Documentation and Runtime Logic

The project maintains two different documentation concerns.

### Runtime API Documentation

Located under:

```text
src/docs/
```

This contains OpenAPI definitions used by the application and Swagger UI.

### Project Documentation

Located under:

```text
docs/
```

This contains human-oriented documentation such as:

* Architecture
* Authentication flows
* Token management
* Security
* Deployment
* Development
* Design decisions

The distinction keeps executable API documentation separate from conceptual project documentation.

---

# 31. Environment Configuration

Environment variables are not accessed randomly throughout the application.

They are validated and organized through the environment configuration layer.

Different configuration concerns have separate schemas:

```text
app.schema.js
auth.schema.js
database.schema.js
email.schema.js
oauth.schema.js
rateLimit.schema.js
redis.schema.js
```

This provides:

* Centralized configuration
* Early validation
* Clear ownership of configuration
* Reduced risk of missing environment variables

---

# 32. Security Over Convenience

The overall design intentionally favors security for authentication-sensitive operations.

Examples include:

* Short-lived access tokens
* Refresh-token rotation
* Server-side refresh-token storage
* Access-token blacklisting
* OTP expiration
* OTP rate limiting
* Authentication rate limiting
* Input validation
* Role-based authorization
* Secure authentication cookies
* Centralized error handling

No individual mechanism provides complete security.

The design instead uses multiple layers so that compromising one credential or bypassing one control does not automatically compromise the entire authentication system.

---

# 33. Design Philosophy

The overall design follows several principles:

### Separation of Concerns

Each part of the system should have a clear responsibility.

### Reusability

Authentication should be reusable across future projects.

### Security by Design

Security controls should be part of the architecture rather than added only after implementation.

### Testability

Important authentication flows should be testable independently and through complete integration tests.

### Maintainability

The project should remain understandable as more authentication features are added.

### Independent Evolution

The authentication subsystem should be capable of evolving independently from the applications that consume it.

The overall objective is therefore not to build the smallest possible authentication implementation, but to build an authentication subsystem that can serve as a reusable foundation for future applications.