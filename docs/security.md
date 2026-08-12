# Security

This document describes the security mechanisms implemented in the Authentication Subsystem, the threats they are intended to mitigate, and the security principles followed throughout the system.

Authentication is a security-sensitive subsystem. Therefore, security controls are distributed across multiple layers rather than relying on a single mechanism.

The security model can be summarized as:

```text
Client
  ↓
Rate Limiting
  ↓
Input Validation
  ↓
Authentication
  ↓
Authorization
  ↓
Business Logic
  ↓
Database / Infrastructure
```

Each layer provides a different security boundary.

---

# 1. Security Objectives

The primary security objectives of the subsystem are:

* Prevent unauthorized access
* Protect user credentials
* Reduce the impact of stolen tokens
* Prevent authentication endpoint abuse
* Protect password-reset and email-verification flows
* Enforce role-based authorization
* Prevent invalid input from reaching business logic
* Protect sensitive configuration
* Provide traceability through request IDs and logging
* Allow authentication sessions to be revoked
* Minimize the lifetime of temporary authentication data

Security is treated as a system-wide concern rather than an isolated feature.

---

# 2. Password Security

User passwords are never intended to be stored as plaintext.

Passwords are processed through password hashing before being persisted in MongoDB.

The authentication system therefore follows:

```text
Plain Password
      ↓
Password Hashing
      ↓
Database
```

During login:

```text
Submitted Password
      ↓
Compare with Stored Hash
      ↓
Valid?
 ┌────┴────┐
Yes        No
 ↓          ↓
Login      Reject
```

The original password is not stored as a recoverable value.

---

# 3. Password Validation

Passwords are validated before reaching the authentication service.

The registration and login schemas enforce requirements such as:

* Minimum length
* Maximum length
* Uppercase character
* Lowercase character
* Number
* Special character

The validation layer prevents obviously weak or malformed credentials from reaching the business logic.

The password length is also bounded to prevent unnecessarily large input from being processed.

---

# 4. Input Validation

The subsystem uses Zod for request validation.

Validation occurs before controller and service logic.

For example:

```text
HTTP Request
     ↓
Validation Middleware
     ↓
Valid Input?
 ┌────┴────┐
Yes        No
 ↓          ↓
Controller  Reject
```

This provides an early boundary against malformed input.

Validation is applied to authentication-sensitive request bodies such as:

* Registration
* Login
* Email verification
* Resending verification emails
* Password reset
* Google authentication
* Role updates

---

# 5. Email Verification

New user registration requires email verification.

The registration process does not immediately create the final user account.

Instead:

```text
Registration
    ↓
Generate OTP
    ↓
Store Temporary Data in Redis
    ↓
Send OTP by Email
    ↓
User Submits OTP
    ↓
Verify OTP
    ↓
Create User
```

This helps prevent arbitrary or unverified email addresses from becoming fully registered accounts.

---

# 6. OTP Security

OTP values are temporary credentials and are therefore stored in Redis rather than permanently in MongoDB.

Redis provides automatic expiration.

Conceptually:

```text
OTP
 ↓
Redis
 ↓
Expiration
 ↓
Automatic deletion
```

This reduces the lifetime of sensitive temporary authentication information.

OTP input is also validated to ensure that it follows the expected format.

For example, verification OTPs must contain exactly six digits.

---

# 7. OTP Rate Limiting

OTP-related endpoints are protected by rate limiting.

This applies to operations such as:

* Email verification
* Resending verification emails
* Password-reset requests

Without rate limiting, an attacker could repeatedly request OTPs or repeatedly submit guesses.

The protection is:

```text
OTP Request
    ↓
Rate Limiter
    ↓
Allowed?
 ┌───┴───┐
Yes      No
 ↓        ↓
Process  Reject
```

This reduces brute-force and resource-abuse opportunities.

---

# 8. Password Reset Security

The password-reset flow uses a temporary OTP.

The general flow is:

```text
Forgot Password
      ↓
Generate Reset OTP
      ↓
Store Temporary Information
      ↓
Send Email
      ↓
User Provides OTP
      ↓
Validate OTP
      ↓
Update Password
```

The reset information is temporary and is stored in Redis.

This prevents password-reset credentials from becoming permanent database records.

---

# 9. Access Token Security

Access tokens are short-lived JWTs.

Short expiration reduces the amount of time a stolen access token can be used.

The token contains a unique `jti`, which allows the system to identify the specific token later.

The security model is:

```text
Short-lived JWT
      +
Unique jti
      +
Signature verification
      +
Expiration verification
      +
Blacklist verification
```

---

# 10. Refresh Token Security

Refresh tokens are more sensitive because they have a longer lifetime.

The subsystem therefore applies additional controls.

Refresh tokens are:

* Stored in an authentication cookie
* Stored server-side in MongoDB
* Validated before use
* Compared against the stored refresh token
* Rotated after successful refresh
* Removed during logout
* Expiration-bound

This gives the server control over a credential that would otherwise behave like a completely stateless long-lived JWT.

---

# 11. Refresh Token Rotation

Every successful refresh operation generates a new refresh token.

```text
Old Refresh Token
        ↓
Validate
        ↓
Generate New Refresh Token
        ↓
Replace Stored Token
```

The previous refresh token is no longer the current stored credential.

This reduces the value of a previously captured refresh token.

---

# 12. Access Token Revocation

JWT access tokens are normally self-contained and therefore remain valid until their expiration.

The subsystem adds a Redis blacklist to support immediate revocation.

When a user logs out:

```text
Access Token
     ↓
Extract jti
     ↓
Redis blacklist
     ↓
revoked
```

Future requests containing that token are rejected.

This closes an important security gap in ordinary stateless JWT authentication.

---

# 13. Automatic Blacklist Expiration

Blacklist entries are given an expiration equal to the remaining lifetime of the access token.

For example:

```text
Access Token
Expires in 10 minutes
        ↓
Logout
        ↓
Blacklist entry
EX = 10 minutes
```

After the token could no longer be valid anyway, Redis automatically removes the blacklist entry.

This prevents the revocation store from growing indefinitely.

---

# 14. Secure Logout

Logout performs multiple security operations.

```text
Logout
  │
  ├── Verify Access Token
  │
  ├── Remove Refresh Token from MongoDB
  │
  ├── Blacklist Access Token
  │
  └── Clear Authentication Cookie
```

This ensures that both the server-side session state and the client-side refresh credential are invalidated.

---

# 15. Authentication Middleware

Protected routes use access-token verification middleware.

The middleware verifies:

1. Authorization header
2. Bearer token
3. JWT signature
4. Token expiration
5. Token blacklist status

Only after these checks succeed is authentication information attached to the request.

```text
Request
  ↓
Extract Token
  ↓
Verify Signature
  ↓
Check Expiration
  ↓
Check Blacklist
  ↓
Authenticated Request
```

This prevents controllers from having to implement authentication checks independently.

---

# 16. Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> Is this user allowed to perform this operation?

The subsystem implements role-based authorization.

The primary roles are:

```text
user
admin
```

Administrative endpoints use authorization middleware after authentication.

For example:

```text
Request
  ↓
verifyAccessToken
  ↓
authorize("admin")
  ↓
Admin Controller
```

A valid user token alone is therefore insufficient to access administrative operations.

---

# 17. Administrative Operations

Administrative operations are protected more strictly than ordinary authenticated operations.

Examples include:

* Registering an administrator
* Listing users
* Deleting users
* Changing user roles

These operations require an authenticated administrator.

The application also prevents administrators from performing certain dangerous operations on themselves.

For example:

```text
Admin
  ↓
Attempt to delete own account
  ↓
Rejected
```

and:

```text
Admin
  ↓
Attempt to change own role
  ↓
Rejected
```

These controls prevent accidental self-lockout and certain privilege-management mistakes.

---

# 18. Rate Limiting

Authentication endpoints are protected with dedicated rate limiters.

Examples include:

```text
Login
Registration
Email Verification
Resend Verification
Forgot Password
Reset Password
Google Login
Refresh Token
Administrative Operations
```

Different authentication operations have different abuse characteristics, so the system provides separate rate-limiters rather than treating every endpoint identically.

Rate limiting helps mitigate:

* Brute-force attacks
* OTP guessing
* Credential stuffing
* Email abuse
* Automated registration
* Authentication endpoint flooding

---

# 19. Redis as Security Infrastructure

Redis is not used only for temporary application data.

It also participates in security mechanisms.

It is used for:

* OTP storage
* OTP expiration
* Verification cooldowns
* Password-reset temporary data
* Access-token blacklisting
* Rate-limiting state

This makes Redis an important part of the security architecture.

Because many of these values are temporary, Redis's expiration capabilities are particularly useful.

---

# 20. Cookie Security

The refresh token is stored in an authentication cookie.

The cookie configuration is centralized in a cookie utility rather than being duplicated across controllers.

This ensures that authentication-cookie behavior remains consistent across:

* Login
* Registration
* Google authentication
* Refresh-token rotation
* Logout

The cookie should be configured appropriately for the deployment environment, including security-related attributes such as `HttpOnly`, `Secure`, and an appropriate `SameSite` policy.

---

# 21. CORS

Cross-origin access is controlled through application configuration.

The allowed origin should be explicitly configured for the environment rather than allowing arbitrary origins.

This is especially important because authentication uses cookies.

An overly permissive CORS policy could allow an unauthorized origin to interact with authenticated browser sessions.

---

# 22. Environment Variable Protection

Sensitive configuration is provided through environment variables rather than hard-coded application source code.

Examples include:

* Database credentials
* Redis configuration
* JWT secrets
* Email credentials
* Google OAuth credentials
* Application configuration

Environment schemas validate the configuration before the application starts.

This reduces the risk of starting the application with missing or invalid security-critical configuration.

---

# 23. JWT Secret Separation

Access-token and refresh-token signing secrets are maintained separately.

Conceptually:

```text
ACCESS_TOKEN_SECRET
        ↓
Access Token

REFRESH_TOKEN_SECRET
        ↓
Refresh Token
```

This prevents compromise of one signing secret from automatically allowing an attacker to forge both types of token.

---

# 24. Error Handling

The application uses centralized error handling.

The global error middleware:

* Determines the HTTP status
* Logs the error
* Creates a consistent response
* Includes the request ID
* Hides internal error details in production

In development, the stack trace can be returned to assist debugging.

In production, internal implementation details should not be exposed to clients.

The production response therefore uses a generic message for unexpected server errors.

```text
Unexpected Error
      ↓
Global Error Middleware
      ↓
Log Detailed Error
      ↓
Return Generic Client Message
```

This reduces information leakage.

---

# 25. Request IDs and Security Logging

Every request receives a request ID.

The request ID is included in:

* Application logs
* API responses

This allows an individual request to be traced across the system.

For example:

```text
Request
requestId = req_abc123
      ↓
Authentication
      ↓
Service
      ↓
Database
      ↓
Log
      ↓
Response
requestId = req_abc123
```

This is particularly useful when investigating suspicious authentication activity or production failures.

---

# 26. Logging Sensitive Information

Authentication systems handle sensitive information.

Logs should therefore avoid exposing:

* Passwords
* Access tokens
* Refresh tokens
* OTP values
* JWT secrets
* Email credentials

The logging layer should record enough information to diagnose problems without turning application logs into a source of credential leakage.

---

# 27. Google Authentication Security

Google authentication uses Google's identity infrastructure to authenticate users.

The application receives a Google ID token and verifies it before establishing an application session.

The flow is:

```text
Google
  ↓
Google ID Token
  ↓
Server-side verification
  ↓
Identify User
  ↓
Create Application Session
```

The application should never trust an ID token simply because it was supplied by the client.

The token must be verified before its identity information is used.

---

# 28. Database Security

MongoDB is used as the persistent authentication database.

Security considerations include:

* Do not expose database credentials in source code
* Use environment-based configuration
* Restrict database network access
* Use authentication for database connections
* Avoid exposing the database directly to the public internet
* Use separate databases or configurations for testing and development
* Apply appropriate database permissions

The application should only receive the database privileges it actually requires.

---

# 29. Redis Security

Redis contains temporary but potentially sensitive authentication information.

Security considerations include:

* Protect Redis from public exposure
* Use authentication where required
* Restrict network access
* Use environment-based configuration
* Avoid logging sensitive Redis values
* Configure appropriate expiration times

Temporary data should still be treated as sensitive data while it exists.

---

# 30. Docker Security

Docker provides environment isolation, but containerization itself is not a complete security mechanism.

The deployment should still:

* Avoid running unnecessary services
* Avoid exposing internal databases publicly
* Keep secrets outside images
* Avoid copying `.env` files into images
* Use minimal production images where practical
* Keep dependencies updated
* Run containers with only the privileges they require

Docker improves isolation and reproducibility, but application and infrastructure security must still be handled separately.

---

# 31. Dependency Security

The subsystem depends on third-party packages for important functionality such as:

* Express
* Mongoose
* Redis
* JWT
* Zod
* Nodemailer
* Google authentication
* Jest
* Swagger

Dependencies should be kept reasonably up to date and audited for known vulnerabilities.

A secure application can still become vulnerable through an outdated dependency.

---

# 32. Testing Security-Critical Behavior

Security-sensitive behavior is covered by automated tests.

Examples include:

* Invalid access tokens
* Protected routes
* Logout
* Refresh-token behavior
* Rate limiting
* Authentication flows
* Role-based access
* Password-reset flows
* Email verification
* User-management restrictions

Security controls should be tested as behavior, not merely assumed to work because the implementation exists.

---

# 33. Threats and Mitigations

| Threat                           | Mitigation                                             |
| --------------------------------- | -------------------------------------------------------- |
| Password brute force             | Login rate limiting                                    |
| Credential stuffing              | Login rate limiting + password authentication controls |
| OTP brute force                  | OTP validation + rate limiting + expiration            |
| Verification-email abuse         | Verification rate limiting                             |
| Password-reset abuse             | Password-reset rate limiting + temporary OTP           |
| Stolen access token              | Short expiration + blacklist                           |
| Stolen refresh token             | Server-side storage + rotation + expiration            |
| Session reuse after logout       | Refresh-token removal + access-token blacklist         |
| Unauthorized admin access        | Access-token verification + role authorization         |
| Malformed requests               | Zod validation                                         |
| Internal error leakage           | Centralized production error handling                  |
| Missing security configuration   | Environment validation                                 |
| Arbitrary cross-origin access    | CORS configuration                                     |
| Temporary credential persistence | Redis expiration                                       |
| Accidental self-admin lockout    | Self-role/self-delete restrictions                     |

---

# 34. Defense in Depth

The subsystem does not depend on a single security mechanism.

For example, protecting a sensitive operation may involve:

```text
Rate Limiting
      ↓
Input Validation
      ↓
Access Token Verification
      ↓
Blacklist Verification
      ↓
Role Authorization
      ↓
Business Validation
      ↓
Database Operation
```

If one layer fails to prevent an attack, additional layers may still prevent the attacker from reaching or abusing the underlying operation.

This is the principle of defense in depth.

---

# 35. Security Limitations

Security mechanisms reduce risk but cannot eliminate every possible attack.

Some risks depend on the deployment environment and client application.

Examples include:

* Compromise of the user's device
* Compromise of environment secrets
* Compromise of the email account
* Compromise of infrastructure
* Misconfigured production CORS
* Incorrect cookie configuration
* Database compromise
* Redis compromise
* Vulnerabilities in third-party dependencies
* Social engineering
* Server or hosting-provider compromise

The subsystem therefore provides security controls at the application layer while relying on the deployment environment to provide additional infrastructure security.

---

# 36. Production Security Checklist

Before deploying the subsystem to production, verify:

* [ ] Strong JWT secrets are configured
* [ ] Access and refresh secrets are different
* [ ] Production environment variables are configured securely
* [ ] Passwords are never logged
* [ ] Tokens are never logged
* [ ] OTPs are never logged
* [ ] Authentication cookies use appropriate security attributes
* [ ] HTTPS is enabled
* [ ] CORS allows only trusted origins
* [ ] MongoDB is not publicly exposed unnecessarily
* [ ] Redis is not publicly exposed unnecessarily
* [ ] Production error responses do not expose stack traces
* [ ] Rate limits are appropriate for production traffic
* [ ] Google OAuth credentials are configured securely
* [ ] Database credentials are protected
* [ ] Redis credentials are protected where applicable
* [ ] Dependencies are audited and updated
* [ ] Docker images do not contain secrets
* [ ] Production containers run with appropriate privileges
* [ ] Logging does not expose sensitive authentication data
* [ ] Monitoring and alerting are configured
* [ ] Backup and recovery procedures exist for persistent data

---

# 37. Security Philosophy

The security philosophy of the subsystem is based on several principles.

### Minimize Exposure

Sensitive credentials should exist for as little time as practical.

### Validate Early

Invalid input should be rejected before reaching business logic.

### Authenticate Before Authorizing

A user must first be identified before determining what they are allowed to do.

### Limit Privileged Operations

Administrative functionality should have stronger access controls.

### Revoke When Necessary

Long-lived sessions and tokens must have mechanisms for server-side invalidation.

### Expire Temporary Data

OTP and revocation data should not remain indefinitely.

### Fail Safely

Unexpected errors should not expose internal implementation details.

### Defense in Depth

Security should be implemented across multiple independent layers.

---

# 38. Summary

The Authentication Subsystem uses multiple security mechanisms together:

```text
                    Security
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
   Credentials      Tokens          Authorization
       │               │                │
   Hashing        JWT + Rotation     RBAC
   Validation     Blacklisting       Admin checks
       │               │                │
       └───────────────┼────────────────┘
                       ↓
                 Rate Limiting
                       ↓
                 Input Validation
                       ↓
              Centralized Errors
                       ↓
                Secure Logging
                       ↓
              Protected Infrastructure
```

No single mechanism is expected to provide complete protection.

The subsystem instead combines authentication, authorization, token management, temporary credential handling, rate limiting, validation, error handling, infrastructure protection, and testing to create multiple security boundaries around the authentication system.