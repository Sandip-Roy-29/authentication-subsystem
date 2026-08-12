# Authentication Subsystem

A reusable, production-oriented authentication subsystem built with Node.js and Express.js.

The purpose of this subsystem is to separate authentication concerns from the main application. Instead of implementing authentication independently in every future project, this subsystem can be developed, improved, tested, and reused as an independent component.

The subsystem is intentionally designed to be feature-rich and independently maintainable, allowing authentication-related functionality to evolve without tightly coupling it to the business logic of individual applications.

---

## Why This Subsystem Exists

Authentication is a fundamental requirement of most applications, but implementing and maintaining it repeatedly across different projects introduces unnecessary duplication and makes security improvements harder to manage.

This project separates authentication from the main application so that:

* Authentication logic can be developed independently.
* Security improvements can be implemented in one place.
* Authentication functionality can be reused across multiple projects.
* Testing can be performed independently from application-specific business logic.
* The authentication architecture can evolve without significantly affecting consuming applications.
* Authentication-related infrastructure and responsibilities remain clearly separated from the main application.

The long-term goal is to have a dedicated authentication subsystem that can serve as the authentication foundation for future applications.

---

## Features

The subsystem currently provides:

* User registration
* Email verification using OTP
* Resend verification email
* Login with email and password
* Google authentication
* Access-token authentication
* Refresh-token authentication
* Refresh-token rotation
* Logout and token revocation
* Access-token blacklist using Redis
* Forgot-password workflow
* Password reset using OTP
* Role-based authorization
* Admin user registration
* User management
* Rate limiting
* Request validation
* Centralized error handling
* Request ID generation and logging
* Health monitoring
* Unit testing
* Integration testing
* OpenAPI API documentation
* Swagger UI
* Environment-variable validation
* Docker-based development and testing support

---

## Technology Stack

| Technology  | Purpose                                                          |
| ----------- | ---------------------------------------------------------------- |
| Node.js     | Backend runtime                                                  |
| Express.js  | HTTP server and routing                                          |
| MongoDB     | Persistent user and application data                             |
| Mongoose    | MongoDB object modeling                                          |
| Redis       | Temporary data, OTPs, token blacklist, and session-related state |
| JWT         | Access and refresh token authentication                          |
| Zod         | Request and environment-variable validation                      |
| Nodemailer  | Email delivery                                                   |
| Google Auth | Google authentication                                            |
| Jest        | Unit and integration testing                                     |
| Docker      | Environment isolation and deployment support                     |
| OpenAPI     | Machine-readable API documentation                               |
| Swagger UI  | Interactive API documentation                                    |

---

## High-Level Architecture

The subsystem follows a layered architecture with a strong separation of responsibilities.

```text
                    Process Startup
                          │
                          ▼
                 Critical Bootstraps
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          MongoDB       Redis         Mail
             │            │            │
             └────────────┼────────────┘
                          ▼
                 Application Composition
                          │
                  ┌───────┴───────┐
                  ▼               ▼
             Rate Limiters      Routers
                  │               │
                  └───────┬───────┘
                          ▼
                   Express App
                          │
                          ▼
                    HTTP Server
                          │
                          ▼
                    HTTP Request
                          │
                          ▼
                     Middleware
                          │
                          ▼
                      Controller
                          │
                          ▼
                       Service
                          │
                ┌─────────┼─────────┐
                ▼         ▼         ▼
             MongoDB    Redis      Mail
```

The system separates:

* **Bootstrap** — initializes infrastructure required before the application can run.
* **Composition** — creates and wires application dependencies.
* **Application** — defines middleware and routes.
* **Middleware** — handles cross-cutting concerns and request authentication/validation.
* **Controllers** — handle HTTP requests and responses.
* **Services** — contain the core business logic.
* **Infrastructure** — communicates with external systems such as MongoDB, Redis, email, and Google.
* **Utilities** — provide reusable supporting functionality such as token generation, cookie management, and session creation.

More details are available in the [Architecture Documentation](docs/architecture.md).

---

## Authentication Model

The subsystem uses a two-token JWT authentication model.

```text
                     Authentication
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        Access Token              Refresh Token
        Short-lived                Long-lived
              │                         │
              ▼                         ▼
      Protected APIs              Cookie + DB
                                        │
                                        ▼
                                Token Rotation
```

### Access Token

The access token is a short-lived JWT used to access protected resources.

It is sent with requests through the `Authorization` header:

```http
Authorization: Bearer <access-token>
```

The token contains information such as the user's identity, email, role, expiration time, and JWT ID (`jti`).

### Refresh Token

The refresh token is long-lived and is used to obtain new access tokens when the access token expires.

The refresh token is:

* Stored in the database.
* Delivered through an authentication cookie.
* Rotated when a refresh operation succeeds.
* Removed from the database during logout.

### Token Revocation

Access tokens are normally stateless, but the subsystem supports explicit revocation through a Redis blacklist.

When a user logs out:

```text
Logout
  │
  ├── Remove refresh token from MongoDB
  │
  ├── Blacklist access-token jti in Redis
  │
  └── Clear authentication cookies
```

The Redis blacklist entry automatically expires when the affected access token reaches its expiration time.

More details are available in the [Token Management Documentation](docs/token-management.md).

---

## Authentication Flow

A typical registration flow looks like:

```text
Register
   │
   ▼
Rate Limiting
   │
   ▼
Request Validation
   │
   ▼
Controller
   │
   ▼
Authentication Service
   │
   ├── Check existing user
   ├── Generate OTP
   ├── Store temporary verification data in Redis
   └── Send verification email
   │
   ▼
User submits OTP
   │
   ▼
Verify Email
   │
   ▼
Create User in MongoDB
   │
   ▼
Create Authentication Session
   │
   ├── Access Token
   └── Refresh Token
```

Redis is used for temporary data such as email verification and password-reset OTPs. Temporary data is stored with an appropriate expiration period and is removed when it is no longer required.

See the [Authentication Flow Documentation](docs/authentication-flow.md) for detailed workflows.

---

## API Documentation

The subsystem provides an OpenAPI 3.1 specification and Swagger UI for interactive API documentation.

The OpenAPI specification describes:

* Available endpoints
* Request bodies
* Parameters
* Authentication requirements
* Request schemas
* Response schemas
* Error responses
* API models

Swagger UI provides an interactive interface for exploring and testing the API.

The API documentation is maintained separately from the architectural documentation so that the API contract remains machine-readable and easy to consume.

---

## Testing

The project uses Jest for automated testing.

Testing is divided into:

* Unit tests for isolated application components.
* Integration tests for interactions between multiple application components.

The project also supports a separate test database configuration to prevent tests from interfering with development data.

---

## Project Structure

```text
authentication-subsystem/
│
├── docs/                              # System and engineering documentation
│   ├── architecture.md
│   ├── authentication-flow.md
│   ├── deployment.md
│   ├── design-decision.md
│   ├── development.md
│   ├── security.md
│   └── token-management.md
│
├── scripts/                           # Operational and utility scripts
│   └── seedAdmin.js
│
├── src/                               # Application source code
│   │
│   ├── bootstraps/                    # Infrastructure initialization
│   │   ├── critical/
│   │   │   ├── database.bootstrap.js
│   │   │   └── redis.bootstrap.js
│   │   └── optional/
│   │       └── mail.bootstrap.js
│   │
│   ├── composition/                   # Application dependency composition
│   │   └── createApplication.js
│   │
│   ├── config/                        # Application configuration
│   │   └── env/                       # Environment variable schemas
│   │
│   ├── docs/                          # OpenAPI specification
│   │   ├── components/                # Reusable OpenAPI components
│   │   ├── paths/                     # API endpoint definitions
│   │   └── openapi.js                 # OpenAPI specification
│   │
│   ├── infrastructure/                # External system integrations
│   │   ├── database/                  # MongoDB connection
│   │   ├── mail/                      # Email infrastructure
│   │   ├── passport/                  # Google authentication
│   │   └── redis/                     # Redis connection
│   │
│   ├── modules/                       # Feature-oriented application modules
│   │   │
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── validators/
│   │   │
│   │   └── user/
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── routes/
│   │       ├── services/
│   │       └── validators/
│   │
│   ├── routes/                        # Application-level routes
│   │   └── health.route.js
│   │
│   └── shared/                        # Cross-module functionality
│       ├── middlewares/
│       └── utils/
│
├── tests/                             # Automated test suite
│   ├── helper/                        # Reusable test helpers
│   ├── integration/                   # Integration tests
│   ├── mocks/                         # External dependency mocks
│   ├── setups/                        # Test environment setup
│   └── unit/                           # Unit tests
│
├── Dockerfile                         # Production container image
├── Dockerfile.dev                     # Development container image
├── Dockerfile.test                    # Test container image
├── docker-compose.yml                 # Base Docker configuration
├── docker-compose.dev.yml             # Development environment
├── docker-compose.test.yml            # Test environment
│
├── server.js                          # Server lifecycle and startup
├── package.json                        # Project metadata and dependencies
├── jest.config.js                      # Jest configuration
├── eslint.config.js                    # ESLint configuration
├── commitlint.config.js                # Commit message validation
├── LICENSE
└── README.md
```

### Directory Responsibilities

| Directory            | Responsibility                                                               |
| -------------------- | ---------------------------------------------------------------------------- |
| `src/bootstraps`     | Initializes infrastructure required before the application starts            |
| `src/composition`    | Creates and wires application dependencies                                   |
| `src/config`         | Defines and validates application configuration                              |
| `src/docs`           | Contains the OpenAPI specification and reusable API documentation components |
| `src/infrastructure` | Handles communication with external systems                                  |
| `src/modules/auth`   | Contains authentication and authorization functionality                      |
| `src/modules/user`   | Contains user management functionality                                       |
| `src/routes`         | Contains application-level routes such as health checks                      |
| `src/shared`         | Contains functionality shared across multiple modules                        |
| `tests`              | Contains unit and integration testing infrastructure                         |
| `docs`               | Contains human-readable system and engineering documentation                 |
| `scripts`            | Contains operational scripts such as administrative data seeding             |

### Module Structure

The feature modules follow a consistent internal structure.

For example, the authentication module is organized as:

```text
src/modules/auth/
│
├── controllers/       # HTTP request/response handling
├── middlewares/       # Authentication and authorization middleware
├── routes/            # Authentication endpoint declarations
├── services/          # Authentication business logic
├── utils/             # Authentication-specific utilities
└── validators/        # Request validation schemas
```

The user module follows a similar structure:

```text
src/modules/user/
│
├── controllers/
├── models/
├── routes/
├── services/
└── validators/
```

This organization keeps related functionality together while maintaining clear boundaries between HTTP handling, business logic, validation, data access, and supporting functionality.

### Tests

The test suite is organized according to the type of testing being performed:

```text
tests/
│
├── helper/            # Reusable test setup and workflow helpers
├── integration/       # Tests complete application workflows
├── mocks/             # Mocks for external dependencies
├── setups/            # Test environment initialization
└── unit/              # Tests isolated units of functionality
```

Integration tests cover important authentication workflows such as registration, email verification, login, logout, refresh-token rotation, password recovery, Google authentication, rate limiting, and protected routes.

Unit tests cover isolated components such as middleware, utilities, models, token generation, cookies, and API responses.

---

## Getting Started

### Prerequisites

The project requires:

* Node.js
* MongoDB
* Redis
* A configured email provider
* Google OAuth credentials for Google authentication
* Docker (optional, depending on the development environment)

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Create the required environment configuration according to the project's environment schemas.

The subsystem validates environment variables during startup to prevent the application from running with invalid or incomplete configuration.

### Start the Development Server

```bash
npm run dev
```

The development server runs the configured Express application and starts listening for HTTP requests.

---

## Documentation

Detailed documentation is organized by topic:

| Document                                           | Description                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Architecture](docs/architecture.md)               | System architecture, application lifecycle, layers, and responsibilities                 |
| [Authentication Flow](docs/authentication-flow.md) | Registration, login, email verification, password recovery, and authentication workflows |
| [Token Management](docs/token-management.md)       | Access tokens, refresh tokens, rotation, revocation, and logout                          |
| [Security](docs/security.md)                       | Security mechanisms and their purpose                                                    |
| [Design Decisions](docs/design-decisions.md)       | Architectural and technology choices and their reasoning                                 |
| [Development](docs/development.md)                 | Development environment, testing, and contribution workflow                              |
| [Deployment](docs/deployment.md)                   | Production deployment and infrastructure considerations                                  |

---

## Design Philosophy

The subsystem follows a few core principles:

### Separation of Concerns

Authentication, infrastructure, business logic, HTTP handling, and application composition are kept separate.

### Reusability

The subsystem is designed to be reusable across multiple future applications.

### Security

Authentication credentials and temporary sensitive data are handled according to their different lifetimes and security requirements.

### Testability

The architecture separates responsibilities so individual components and complete workflows can be tested independently.

### Independent Evolution

The authentication subsystem should be able to evolve independently from the applications that consume it.

---

## Project Status

This project is actively developed as a reusable authentication foundation.

The current implementation provides the core authentication, authorization, token management, email verification, password recovery, Google authentication, testing, and API documentation required for integration into future applications.

Production hardening and additional infrastructure capabilities can be added independently as the subsystem evolves.