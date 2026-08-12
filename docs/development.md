# Development Guide

This document explains how to set up, run, test, and develop the Authentication Subsystem locally.

The project is designed as an independent authentication subsystem that can be developed and improved separately from the applications that consume it.

---

# 1. Prerequisites

The following tools are required for local development:

* Node.js 22+
* npm
* MongoDB
* Redis
* Docker and Docker Compose
* Git

The project uses ECMAScript modules and Node.js package imports.

---

# 2. Project Setup

Clone the repository and enter the project directory:

```bash
git clone <repository-url>

cd authentication-subsystem
```

Install dependencies:

```bash
npm install
```

After installing dependencies, verify the Node.js version:

```bash
node --version
```

The project is developed against Node.js 22.

---

# 3. Environment Configuration

The application configuration is provided through environment variables.

Create the appropriate environment file according to the development setup.

The configuration is validated when the application starts.

The environment configuration is divided into several categories:

```text
Application
Authentication
Database
Redis
Email
OAuth
Rate Limiting
```

The corresponding validation schemas are located in:

```text
src/config/env/
```

For example:

```text
app.schema.js
auth.schema.js
database.schema.js
email.schema.js
oauth.schema.js
rateLimit.schema.js
redis.schema.js
```

This keeps environment validation separate from the rest of the application.

---

# 4. Local Infrastructure

The subsystem depends on several infrastructure services.

```text
Authentication Subsystem
        │
        ├── MongoDB
        ├── Redis
        ├── SMTP / Mail Provider
        └── Google OAuth
```

MongoDB provides persistent storage.

Redis provides temporary storage and security-related state.

The mail service is used for:

* Email verification
* Password reset
* Authentication-related emails

Google OAuth is used for Google authentication.

---

# 5. Docker Development Environment

Docker Compose files are provided for different environments.

```text
docker-compose.yml
docker-compose.dev.yml
docker-compose.test.yml
```

The development configuration can be used to run the required infrastructure in an isolated environment.

The development Dockerfile is:

```text
Dockerfile.dev
```

The purpose of the development environment is to make the application and its dependencies reproducible across different machines.

---

# 6. Starting the Development Environment

The application can be started using the development npm script:

```bash
npm run dev
```

The development command starts the application with:

```text
NODE_ENV=development nodemon server.js
```

Nodemon watches the project files and automatically restarts the Node.js process when relevant files change.

The development server listens on the configured application port.

For example:

```text
http://localhost:8000
```

The actual port should come from the environment configuration rather than being assumed by the application.

---

# 7. Application Startup

The development server starts through:

```text
server.js
```

`server.js` is intentionally kept responsible for the server lifecycle rather than application construction.

The startup process is approximately:

```text
npm run dev
     ↓
server.js
     ↓
Bootstrap infrastructure
     ↓
Create application
     ↓
Start HTTP server
```

---

# 8. Bootstrap Phase

Before the HTTP server starts, required infrastructure is initialized.

The bootstrap logic is located under:

```text
src/bootstraps/
```

Critical infrastructure includes:

```text
MongoDB
Redis
```

Optional infrastructure includes:

```text
Mail
```

The separation exists because infrastructure initialization is a prerequisite of running the application.

Instead of putting database, Redis, and mail initialization directly inside `server.js`, these responsibilities are grouped into bootstrap modules.

This keeps `server.js` focused on the server lifecycle.

---

# 9. Application Composition

Application construction is separated into:

```text
src/composition/createApplication.js
```

The composition layer is responsible for assembling the application.

Conceptually:

```text
createApplication()
       ↓
Create Express Application
       ↓
Register Middleware
       ↓
Register Routes
       ↓
Configure Application
       ↓
Return App
```

The returned Express application is then passed to the server lifecycle.

This allows the application to be created independently from the process that starts the HTTP server.

---

# 10. Application vs Server

The project intentionally distinguishes between the application and the server.

### Application

The application represents the configured Express instance.

It contains:

* Middleware
* Routes
* Error handling
* Request processing

### Server

The server is the running HTTP instance created from the application.

Conceptually:

```text
Express Application
        ↓
HTTP Server
        ↓
Listening on Port
```

This separation is particularly useful for testing because tests can create the application without starting a real network server.

---

# 11. Project Architecture During Development

The source code is organized around responsibilities.

```text
src/
├── bootstraps/
├── composition/
├── config/
├── docs/
├── infrastructure/
├── modules/
├── routes/
└── shared/
```

The main application flow is:

```text
Request
  ↓
Shared Middleware
  ↓
Module Middleware
  ↓
Route
  ↓
Controller
  ↓
Service
  ↓
Infrastructure / Database
```

The response follows the reverse direction:

```text
Database / Infrastructure
  ↓
Service
  ↓
Controller
  ↓
ApiResponse
  ↓
Client
```

---

# 12. Authentication Module

Authentication-related functionality is located under:

```text
src/modules/auth/
```

The module contains:

```text
controllers/
middlewares/
routes/
services/
utils/
validators/
```

The authentication module contains features such as:

* Registration
* Email verification
* Login
* Google login
* Logout
* Refresh tokens
* Password reset
* Forgot password
* Authentication middleware
* Authorization middleware

---

# 13. User Module

User-related functionality is located under:

```text
src/modules/user/
```

The module contains:

```text
controllers/
models/
routes/
services/
validators/
```

The user module handles operations such as:

* Retrieving users
* Retrieving the current user
* Updating user roles
* Deleting users
* User-related validation

---

# 14. Shared Layer

Reusable application functionality is located under:

```text
src/shared/
```

The shared layer contains:

```text
middlewares/
utils/
```

Examples include:

* Request ID middleware
* Request logging
* Rate limiting
* Validation middleware
* Error middleware
* API response formatting
* Application errors
* OTP generation
* Logging

The purpose of the shared layer is to prevent reusable infrastructure from being duplicated across modules.

---

# 15. Infrastructure Layer

External infrastructure integrations are located under:

```text
src/infrastructure/
```

The current infrastructure includes:

```text
database/
mail/
passport/
redis/
```

This layer isolates external services from application business logic.

For example:

```text
Service
   ↓
Database Utility
   ↓
MongoDB
```

rather than allowing infrastructure-specific implementation details to spread throughout the application.

---

# 16. Development Documentation

Project-level development documentation is stored outside the source code:

```text
docs/
```

The documentation includes:

```text
architecture.md
authentication-flow.md
deployment.md
design-decision.md
development.md
security.md
token-management.md
```

The distinction is intentional:

```text
src/docs/
    API documentation
    OpenAPI specification

docs/
    Developer documentation
    Architecture
    Design decisions
    Security
    Deployment
```

`src/docs` describes the API itself.

The root-level `docs` directory describes the system and how developers work with it.

---

# 17. API Documentation

The OpenAPI specification is located under:

```text
src/docs/
```

Its structure is divided into:

```text
components/
paths/
openapi.js
```

The OpenAPI documentation describes:

* API endpoints
* Request bodies
* Response schemas
* Authentication mechanisms
* Common API responses
* API errors
* Security requirements
* Tags

This keeps the API documentation modular instead of maintaining one extremely large specification file.

---

# 18. Running Tests

The project uses Jest for automated testing.

Tests are divided into:

```text
tests/
├── unit/
└── integration/
```

Unit tests verify individual pieces of functionality.

Integration tests verify interactions between multiple application components.

---

# 19. Unit Tests

Unit tests are located under:

```text
tests/unit/
```

Examples include tests for:

* API response utility
* Cookie utility
* Token generation
* Access-token middleware
* Error middleware
* User model

Unit tests are intended to isolate a relatively small piece of functionality.

---

# 20. Integration Tests

Integration tests are located under:

```text
tests/integration/
```

Authentication integration tests cover flows such as:

```text
Registration
Email Verification
Login
Logout
Refresh Token
Forgot Password
Reset Password
Google Authentication
Protected Routes
Rate Limiting
```

User integration tests cover user-management functionality.

Integration tests provide confidence that multiple layers work together correctly.

---

# 21. Test Helpers

Reusable test setup and data generation are located under:

```text
tests/helper/
```

Examples include helpers for:

* Creating users
* Creating authenticated users
* Creating authenticated administrators
* Creating pending email verification data
* Creating password-reset data
* Logging in users
* Verifying email addresses
* Creating test applications

The purpose of these helpers is to reduce duplication across integration tests.

---

# 22. Test Environment

The test environment is separated from normal development infrastructure.

The project provides:

```text
Dockerfile.test
docker-compose.test.yml
```

This allows tests to run against an isolated environment rather than accidentally modifying development data.

Test-specific environment configuration should be used for:

* MongoDB
* Redis
* Authentication secrets
* Email configuration

---

# 23. Test Mocks

External dependencies can be mocked when required.

For example:

```text
tests/mocks/transporter.mock.js
```

The mail transporter can be mocked so tests do not need to send real emails.

This makes tests:

* Faster
* Deterministic
* Safer
* Independent from external email services

---

# 24. Database Seeding

The project includes an administrative seed script:

```text
scripts/seedAdmin.js
```

The script can be used to create an initial administrator for environments where an administrator account is required.

Seeding should be performed carefully in production environments.

---

# 25. Development Workflow

A typical development workflow is:

```text
Create Feature
      ↓
Implement Validation
      ↓
Implement Controller
      ↓
Implement Service Logic
      ↓
Integrate Infrastructure
      ↓
Write Unit Tests
      ↓
Write Integration Tests
      ↓
Update OpenAPI Documentation
      ↓
Run Tests
      ↓
Review Changes
      ↓
Commit
```

When adding a new API endpoint, the implementation and documentation should be updated together.

---

# 26. Adding a New Authentication Feature

A typical feature can be implemented using the existing module structure.

For example:

```text
src/modules/auth/

controllers/
    feature.controller.js

services/
    auth.service.js

routes/
    auth.route.js

validators/
    auth.validation.js

middlewares/
    feature.middleware.js

utils/
    feature.util.js
```

The exact files required depend on the feature.

Not every feature requires every layer.

The goal is to place each responsibility in the appropriate layer rather than creating unnecessary abstractions.

---

# 27. Controller Guidelines

Controllers should remain relatively thin.

A controller should primarily:

1. Read request data
2. Call the appropriate service
3. Construct the API response
4. Return the response

For example:

```text
Request
  ↓
Controller
  ↓
Service
  ↓
ApiResponse
  ↓
Response
```

Business rules should generally remain in the service layer.

---

# 28. Service Guidelines

Services contain the primary business logic.

For example, registration logic belongs in the service layer rather than directly inside the route or controller.

A service may:

* Query MongoDB
* Interact with Redis
* Generate authentication data
* Create sessions
* Send emails
* Apply business rules

Controllers should not become containers for business logic.

---

# 29. Utility Guidelines

Utilities contain reusable operations that do not represent an entire business workflow.

Examples include:

```text
createSession.util.js
generateTokens.util.js
saveRefreshToken.util.js
cookie.util.js
generateOtp.util.js
```

A utility can be reused by services without becoming another architectural layer.

For example:

```text
createSession.util.js
```

is a utility, not a layer equivalent to a controller or service.

It encapsulates a reusable operation used by the authentication business logic.

---

# 30. Error Handling During Development

Application errors should be represented using `AppError` when the failure is an expected application-level error.

For example:

```js
throw new AppError("User not found", 404);
```

Unexpected errors should be allowed to reach the centralized error middleware.

The error middleware is responsible for converting errors into consistent API responses.

---

# 31. API Response Convention

Successful responses use:

```text
ApiResponse
```

The utility provides a consistent response structure.

For example:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": null,
  "success": true,
  "meta": {},
  "requestId": "req_abc123",
  "timestamp": "2026-08-10T04:30:00.000Z"
}
```

Using a common response structure makes the subsystem easier for future applications to consume.

---

# 32. Code Quality

The project uses development tooling for maintaining code quality.

Important configuration files include:

```text
eslint.config.js
commitlint.config.js
jest.config.js
package.json
```

ESLint is used for code-quality and consistency checks.

Commitlint is used to enforce commit-message conventions.

Jest is used for automated testing.

---

# 33. Git Workflow

Development should generally happen on a feature or maintenance branch rather than directly on `main`.

Example:

```bash
git checkout -b feature/new-auth-feature
```

After implementation:

```bash
git status
git diff
```

Run the test suite and review the changes before committing.

Example:

```bash
git add .
git commit -m "feat: add new authentication feature"
```

The branch can then be pushed for review and merged into `main`.

---

# 34. Before Creating a Pull Request

Before merging changes, verify:

* [ ] Application starts successfully
* [ ] Environment validation passes
* [ ] MongoDB connection works
* [ ] Redis connection works
* [ ] Required mail configuration works
* [ ] Tests pass
* [ ] New functionality has tests
* [ ] Existing functionality still works
* [ ] OpenAPI documentation is updated
* [ ] Root documentation is updated when architecture changes
* [ ] No secrets are committed
* [ ] No unnecessary files are included
* [ ] Git diff has been reviewed
* [ ] Commit messages follow project conventions

---

# 35. Development Principles

The project follows several development principles.

### Separation of Concerns

Different responsibilities are placed in different parts of the system.

### Thin Controllers

Controllers coordinate requests rather than containing large amounts of business logic.

### Service-Centered Business Logic

Business rules primarily live in services.

### Infrastructure Isolation

External infrastructure is isolated behind the infrastructure layer.

### Reusable Utilities

Small reusable operations are extracted into utilities when appropriate.

### Testability

Application construction is separated from server startup so that the application can be tested independently.

### Documentation Alongside Development

API and architectural documentation should evolve with the implementation.

---

# 36. Development Architecture

The overall development structure can be summarized as:

```text
                    server.js
                       │
                       ↓
                 Bootstrapping
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       MongoDB        Redis        Mail
          │            │            │
          └────────────┼────────────┘
                       ↓
              createApplication()
                       │
                       ↓
                 Express App
                       │
                 ┌─────┴─────┐
                 ↓           ↓
            Middleware     Routes
                 │           │
                 └─────┬─────┘
                       ↓
                  Controller
                       ↓
                    Service
                       ↓
             Infrastructure / Model
                       ↓
                  Data Store
```

This structure allows the subsystem to remain independently maintainable while still being reusable by future applications.

---

# 37. Summary

The development architecture is designed around one primary goal:

> Keep the authentication subsystem independent, maintainable, testable, and reusable.

The project separates:

```text
Server Lifecycle
        ↓
Bootstrapping
        ↓
Application Composition
        ↓
Middleware
        ↓
Routes
        ↓
Controllers
        ↓
Services
        ↓
Utilities / Infrastructure
        ↓
Databases and External Services
```

This separation makes it possible to improve authentication independently from the applications that consume it.

The same subsystem can therefore evolve over time without requiring authentication logic to be repeatedly rebuilt inside every future project.