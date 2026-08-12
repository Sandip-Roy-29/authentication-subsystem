# System Architecture

## Overview

The Authentication Subsystem is designed as an independently maintainable authentication service that separates authentication and authorization concerns from the business logic of the applications that consume it.

The architecture emphasizes:

* Separation of concerns
* Independent infrastructure initialization
* Feature-based module organization
* Clear boundaries between HTTP handling and business logic
* Reusable infrastructure integrations
* Testability
* Independent evolution of the authentication system

The application is built around several major architectural stages:

```text
Process Startup
      |
      v
Critical Bootstraps
      |
      v
Application Composition
      |
      v
Express Application Creation
      |
      v
HTTP Server Startup
      |
      v
Incoming Request
      |
      v
Middleware
      |
      v
Route
      |
      v
Controller
      |
      v
Service
      |
      v
Infrastructure
```

---

# Application Lifecycle

The application is intentionally divided into separate stages instead of placing the entire startup process inside `server.js`.

The main stages are:

1. Bootstrap
2. Application composition
3. Application creation
4. Server startup
5. Request processing

---

## 1. Process Startup

The application starts from `server.js`.

The responsibility of `server.js` is primarily the lifecycle of the HTTP server.

It is responsible for:

* Starting the application
* Starting the HTTP server
* Handling server shutdown
* Closing resources during shutdown

The server itself does not contain the application's business logic.

Conceptually:

```text
server.js
    |
    +-- initialize required resources
    |
    +-- create application
    |
    +-- start HTTP server
    |
    +-- handle shutdown
```

This keeps server lifecycle management separate from application construction and business logic.

---

# 2. Bootstrap Layer

Before the HTTP server starts accepting requests, the application initializes the infrastructure required for the application to operate.

This responsibility is handled by the bootstrap layer.

```text
src/bootstraps/
```

The bootstrap layer is separated from `server.js` because infrastructure initialization is a prerequisite of running the application, while `server.js` should primarily manage the server lifecycle.

This separation also groups related initialization logic together.

---

## Critical Bootstraps

Critical bootstraps initialize dependencies that are required for the application to operate correctly.

```text
src/bootstraps/critical/
├── database.bootstrap.js
├── redis.bootstrap.js
└── index.js
```

Currently, the critical infrastructure includes:

* MongoDB
* Redis

The application should not start normally if a critical dependency cannot be initialized.

### MongoDB Bootstrap

The MongoDB bootstrap establishes the connection to the primary persistent database.

MongoDB is used to store persistent application data, including user information and authentication-related state.

### Redis Bootstrap

The Redis bootstrap establishes the connection to Redis.

Redis is used for temporary and fast-access data such as:

* OTPs
* Temporary verification data
* Token blacklist entries
* Other short-lived authentication state

Redis is particularly suitable for this purpose because it is an in-memory data store and supports automatic key expiration.

---

## Optional Bootstraps

Optional infrastructure is initialized separately.

```text
src/bootstraps/optional/
└── mail.bootstrap.js
```

The mail infrastructure is separated from critical bootstraps because email delivery is not required for every application operation.

The separation allows the application to distinguish between infrastructure that is absolutely required to run and infrastructure that provides optional functionality.

---

# 3. Application Composition

After the required infrastructure has been initialized, the application is composed.

This responsibility belongs to:

```text
src/composition/createApplication.js
```

The composition layer is responsible for creating and wiring the dependencies required by the application.

Currently, this includes:

* Rate limiters
* Authentication router
* User router

Conceptually:

```text
createApplication()
        |
        +-- Create rate limiters
        |
        +-- Create authentication router
        |
        +-- Create user router
        |
        +-- Create Express application
        |
        +-- Return application
```

The composition layer keeps dependency creation separate from the actual Express application definition.

This makes the application easier to understand and test because dependencies are explicitly constructed and passed into the application.

---

# 4. Express Application

The Express application is created in:

```text
src/app.js
```

The application defines the HTTP middleware pipeline and mounts the application's routes.

The application is responsible for:

* Express initialization
* JSON request parsing
* Request ID generation
* Request logging
* Cookie parsing
* Proxy configuration
* Route registration
* Global error handling

The application does not start listening on a port.

Instead, it creates and returns an Express application instance.

Conceptually:

```text
createApp()
    |
    +-- Express initialization
    |
    +-- Global middleware
    |
    +-- Health route
    |
    +-- Authentication routes
    |
    +-- User routes
    |
    +-- Global error middleware
    |
    +-- return app
```

---

# 5. Server vs Application

The project intentionally distinguishes between the application and the server.

The Express application represents the configured HTTP application.

The server is the running process that listens for network connections and uses that application.

Conceptually:

```text
Express Application
        |
        v
HTTP Server
        |
        v
Listening on port 8000
```

Therefore, the application itself is not the server.

The server is a running instance that hosts the application and listens for incoming HTTP requests.

This separation also makes the application easier to test because tests can create an application instance without necessarily starting a real network server.

---

# Request Processing Architecture

Once the server is running, incoming requests pass through a defined processing pipeline.

A typical request follows:

```text
HTTP Request
     |
     v
Global Middleware
     |
     v
Rate Limiter
     |
     v
Validation
     |
     v
Authentication / Authorization
     |
     v
Controller
     |
     v
Service
     |
     v
Infrastructure
     |
     v
Service
     |
     v
Controller
     |
     v
HTTP Response
```

Not every endpoint uses every layer.

For example, a public registration endpoint does not require authentication middleware, while an administrative endpoint requires both authentication and authorization.

---

# Middleware Layer

Middleware handles concerns that should occur before the request reaches the controller.

The project contains shared middleware in:

```text
src/shared/middlewares/
```

Authentication-specific middleware is located in:

```text
src/modules/auth/middlewares/
```

Examples include:

* Request ID generation
* Request logging
* Rate limiting
* Request validation
* Access-token verification
* Refresh-token verification
* Role authorization
* Centralized error handling

Middleware allows these concerns to remain separate from controller and service logic.

---

# Route Layer

Routes define the HTTP API surface of the subsystem.

Authentication routes are located in:

```text
src/modules/auth/routes/
```

User routes are located in:

```text
src/modules/user/routes/
```

Application-level routes are located in:

```text
src/routes/
```

For example:

```text
/api/v1/auth
/api/v1/users
/api/v1/me
/health
```

Routes are responsible for declaring:

* HTTP method
* Endpoint path
* Middleware order
* Controller associated with the endpoint

Routes do not contain the core business logic.

---

# Controller Layer

Controllers are responsible for handling HTTP requests and HTTP responses.

Authentication controllers are located in:

```text
src/modules/auth/controllers/
```

User controllers are located in:

```text
src/modules/user/controllers/
```

A controller generally performs three things:

1. Extracts information from the request.
2. Calls the appropriate service.
3. Returns a consistent HTTP response.

For example:

```text
Request
   |
   v
Controller
   |
   v
Service
   |
   v
Controller
   |
   v
Response
```

Controllers should not contain the majority of the application's business rules.

---

# Service Layer

Services contain the primary business logic of the application.

Authentication services are located in:

```text
src/modules/auth/services/
```

User services are located in:

```text
src/modules/user/services/
```

For example, registration business logic includes:

```text
Receive registration data
        |
        v
Check whether user already exists
        |
        v
Generate verification OTP
        |
        v
Store temporary verification data in Redis
        |
        v
Send verification email
```

After the user verifies the OTP:

```text
Verify OTP
    |
    v
Retrieve temporary registration data
    |
    v
Create user
    |
    v
Store user in MongoDB
    |
    v
Create authentication session
```

The service layer therefore contains the actual application behavior rather than simply forwarding requests.

---

# Infrastructure Layer

External systems are accessed through the infrastructure layer.

```text
src/infrastructure/
```

The current infrastructure integrations include:

```text
infrastructure/
├── database/
├── mail/
├── passport/
└── redis/
```

### Database

MongoDB is used as the primary persistent database.

It stores persistent user information and authentication-related state.

### Redis

Redis is used for short-lived and rapidly accessible data.

Examples include:

* Email verification OTPs
* Password reset OTPs
* Temporary verification information
* Access-token blacklist entries

Temporary Redis data can automatically expire through Redis TTL.

### Mail

The mail infrastructure handles email delivery through Nodemailer.

It is used for authentication-related emails such as:

* Email verification
* Password reset

### Google Authentication

Google authentication infrastructure handles Google login integration and verification of Google identity tokens.

---

# Shared Layer

Shared functionality that is used across multiple modules is placed under:

```text
src/shared/
```

It contains:

```text
src/shared/
├── middlewares/
└── utils/
```

Shared middleware includes functionality such as:

* Error handling
* Request validation
* Request ID generation
* Request logging
* Rate limiting

Shared utilities include:

* API response construction
* Application errors
* OTP generation
* Logging

This prevents common functionality from being duplicated between feature modules.

---

# Feature-Based Modules

The application uses feature-oriented modules under:

```text
src/modules/
```

Currently there are two major modules:

```text
src/modules/
├── auth/
└── user/
```

This structure keeps functionality belonging to the same domain together.

---

## Authentication Module

```text
src/modules/auth/
├── controllers/
├── middlewares/
├── routes/
├── services/
├── utils/
└── validators/
```

The authentication module contains:

* Registration
* Email verification
* Login
* Google authentication
* Refresh-token handling
* Logout
* Password recovery
* Password reset
* Authentication middleware
* Authorization middleware
* Authentication-specific utilities
* Request validation

---

## User Module

```text
src/modules/user/
├── controllers/
├── models/
├── routes/
├── services/
└── validators/
```

The user module handles user-related functionality such as:

* Retrieving users
* Deleting users
* Updating user roles
* Retrieving the authenticated user's information

---

# Validation Layer

Request validation is handled using Zod.

Authentication validation schemas are located in:

```text
src/modules/auth/validators/
```

User validation schemas are located in:

```text
src/modules/user/validators/
```

Validation occurs before the request reaches the controller.

For example:

```text
Client Request
      |
      v
Rate Limiter
      |
      v
Zod Validation
      |
      v
Controller
```

This ensures invalid input is rejected before entering the business logic layer.

Environment variables are also validated using Zod schemas under:

```text
src/config/env/
```

---

# Error Handling

The subsystem uses centralized error handling.

The global error middleware is located at:

```text
src/shared/middlewares/error.middleware.js
```

Application-specific errors are represented by:

```text
src/shared/utils/AppError.util.js
```

The error flow is:

```text
Error
  |
  v
Controller / Service / Middleware
  |
  v
Express Error Pipeline
  |
  v
errorMiddleware
  |
  v
Consistent API Error Response
```

The error middleware is responsible for:

* Determining the HTTP status code
* Logging the error
* Returning a consistent response format
* Including the request ID
* Including stack traces during development when appropriate

This prevents individual controllers from implementing their own error-response formats.

---

# Response Architecture

Successful responses use the shared `ApiResponse` utility.

```text
src/shared/utils/ApiResponse.util.js
```

The response structure contains fields such as:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "success": true,
  "meta": {},
  "requestId": "req_abc123",
  "timestamp": "2026-08-10T04:30:00.000Z"
}
```

This provides a consistent response contract across the API.

---

# API Documentation Architecture

API documentation is maintained using OpenAPI 3.1.

The OpenAPI implementation is located under:

```text
src/docs/
├── components/
├── paths/
└── openapi.js
```

Reusable OpenAPI components are separated from endpoint definitions.

```text
components/
├── responses.js
├── schemas.js
├── security.js
└── tags.js
```

API paths are separated into domain-specific files:

```text
paths/
├── auth.js
├── health.js
└── user.js
```

The final OpenAPI specification combines these definitions into a single API contract.

Swagger UI exposes this specification as interactive API documentation.

---

# Dependency Flow

The general dependency direction is:

```text
Routes
  |
  v
Controllers
  |
  v
Services
  |
  v
Infrastructure
```

Supporting concerns are applied around this flow:

```text
                 Configuration
                      |
                      v
Request --> Middleware --> Controller --> Service --> Infrastructure
                      |                    |
                      |                    v
                      |                 Database
                      |                 Redis
                      |                 Mail
                      |
                      v
                  Validation
```

The goal is to prevent lower-level infrastructure details from leaking into route definitions and HTTP handling.

---

# Configuration Architecture

Configuration is centralized under:

```text
src/config/env/
```

Environment variables are separated into domain-specific schemas:

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
* Runtime validation
* Clear ownership of configuration values
* Early failure when required configuration is invalid

The application should not start with invalid critical configuration.

---

# Testing Architecture

Tests are organized under:

```text
tests/
├── helper/
├── integration/
├── mocks/
├── setups/
└── unit/
```

Unit tests verify isolated components.

Integration tests verify complete workflows involving multiple layers.

For example, a registration integration test can exercise:

```text
HTTP Request
     |
     v
Rate Limiter
     |
     v
Validation
     |
     v
Controller
     |
     v
Service
     |
     ├── Redis
     ├── Email
     └── MongoDB
```

This provides confidence that the individual components work together correctly.

---

# Architectural Principles

The architecture follows several core principles.

## Separation of Concerns

Each layer has a specific responsibility.

```text
Bootstrap       -> Infrastructure initialization
Composition     -> Dependency wiring
Application     -> HTTP application configuration
Routes          -> Endpoint declaration
Middleware      -> Request processing concerns
Controllers     -> HTTP handling
Services        -> Business logic
Infrastructure  -> External systems
Utilities       -> Reusable supporting logic
```

## Reusability

Authentication functionality is isolated from application-specific business logic so that the subsystem can be reused across multiple future applications.

## Testability

The application is composed separately from the server and dependencies are organized into distinct layers, allowing components and complete workflows to be tested independently.

## Maintainability

Feature-based modules and clear architectural boundaries make it easier to modify one area without unnecessarily affecting unrelated parts of the system.

## Security by Design

Security mechanisms such as:

* Short-lived access tokens
* Refresh-token rotation
* Token revocation
* Redis blacklisting
* Rate limiting
* Input validation
* Secure cookies
* Password hashing
* Environment validation

are integrated into the architecture rather than being added as isolated features.

---

# Summary

The Authentication Subsystem is organized around a clear lifecycle and separation of responsibilities:

```text
Bootstrap
    |
    v
Composition
    |
    v
Application
    |
    v
Server
    |
    v
Request
    |
    v
Middleware
    |
    v
Route
    |
    v
Controller
    |
    v
Service
    |
    v
Infrastructure
```

This architecture allows the authentication system to remain independently maintainable, testable, reusable, and capable of evolving separately from the applications that consume it.