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
├── src/
│   ├── config/
│   │   └── env.js
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
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │
│   ├── routes/
│   │   └── health.route.js
│   │
│   ├── utils/
│   │   └── logger.js
│   │
│   │
│   └── app.js
│
├── .env.development
├── .env.production
├── .env.test
├── .gitignore
├── .package-lock.json
├── package.json
├── server.js
├── README.md
└── LICENSE
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
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
JWT_SECRET=your_super_secret_jwt_key

# MongoDB connection pool settings
DB_MIN_POOL_SIZE=0
DB_MAX_POOL_SIZE=10
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
See the [LICENSE](../../LICENSE) file for details.