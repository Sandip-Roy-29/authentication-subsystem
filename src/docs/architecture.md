## Architecture

This subsystem follows a layered architecture:

- **Routes** handle API endpoints
- **Controllers** manage business logic
- **Models** interact with the database
- **Middleware** handles authentication and validation
- **Utilities** contain reusable helper functions

---

## Authentication Flow

### Register

- User submits username, email, password, and confirm password
- Input validation is performed
- Password is hashed using bcrypt
- User data is stored in MongoDB
- JWT token is generated
- Token stored in HTTP-only cookies
- User automatically logged in

### Validation Rules

#### Username
- Must be between 3–30 characters
- Numbers allowed
- Spaces allowed

#### Password
- Minimum 8 characters
- Must contain:
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character

#### Email
- Must be a valid email format

#### Confirm Password
- Used only for validation
- Not stored in database

---

### Login

- User submits email and password
- System checks whether the email exists
- Password compared with hashed password
- New JWT token generated
- User redirected to dashboard

---

### Logout

- JWT cookie removed
- User loses access to protected routes

---