# Authentication Subsystem

> A production-grade authentication subsystem built using Node.js, Express.js, MongoDB, JWT, and HTTP-only cookies.

---

## Overview

This project provides a secure and scalable authentication system for modern web applications. It handles user registration, login, logout, authorization, protected routes, and secure password storage using industry-standard practices.

Designed with security best practices in mind.

---

## Features

- User registration
- Input validation
- Secure user login
- User logout
- JWT authentication
- HTTP-only cookie-based authentication
- Protected routes
- Password hashing with bcrypt
- MongoDB database integration

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- bcrypt

---

## Project Structure

```bash
auth-system/
│
│
├── src/
│   ├── config/
│   │   └── env.config.js
│   │
│   ├── db/
│   │   └── connectDB.js
│   │   └── disconnectDB.js
│   │
│   ├── docs/
│   │   └── api.md
│   │   └── architecture.md
│   │
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js
│   │   └── error.middleware.js
│   │   └── requestId.middleware.js
│   │   └── requestLogger.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── models/
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   └── auth.route.js
│   │   └── health.route.js
│   │   └── me.route.js
│   │
│   ├── services/
│   │   └── auth.services.js
│   │
│   ├── utils/
│   │   └── ApiResponse.util.js
│   │   └── AppError.js
│   │   └── generateTokens.util.js
│   │   └── logger.util.js
│   │   └── setAuthCookies.util.js
│   │
│   ├── validation/
│   │   └── auth.validation.js
│   │
│   └── app.js
│
├── server.js
│
├── tests/
│   ├── integration/
│   │   └── auth.test.js
│   └── setup.js
│
├── .env.example
├── .env.development
├── .env.production
├── .env.test
├── .eslintignore
├── .nvmrc
├── .prettierrc
├── .prettierignore
├── .commitlint.config.js
├── .eslint.config.js
├── jest.config.js
├── .gitignore
├── .package-lock.json
├── package.json
├── README.md
└── LICENSE
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/me` | Return authenticated user |
| GET | `/health` | Health check route |


---

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- HTTP-only cookies
- Protected route middleware
- Input validation and sanitization

---

## Environment Variables

Copy a `.env.example` into `.env.development` file:

```env
# Application environment
NODE_ENV=development

# Server configuration
PORT=5000

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/auth-system

# JWT secret key
ACCESS_TOKEN_SECRET=your_secret_key
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_EXPIRY=7d

# MongoDB connection pool settings
DB_MIN_POOL_SIZE=0
DB_MAX_POOL_SIZE=10

# Bcrypt sault rounds
BCRYPT_SALT_ROUNDS=10

```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Sandip-Roy-29/authentication-subsystem
```

Move into project directory:

```bash
cd auth-system
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

---

## Future Improvements

- Refresh token support
- Email verification
- Forgot password functionality
- Rate limiting
- CSRF protection
- Role-based access control
- OAuth authentication
- Account lock after multiple failed attempts

---

## License

This project is licensed under the MIT License.  
See the [LICENSE](./LICENSE) file for details.