# Token Management

This document describes how authentication tokens are created, stored, validated, refreshed, rotated, and revoked in the Authentication Subsystem.

The subsystem uses a dual-token authentication model consisting of:

* Access tokens
* Refresh tokens

The purpose of this design is to provide authenticated access while limiting the impact of compromised credentials and allowing sessions to continue without requiring users to log in repeatedly.

---

# 1. Token Architecture

The authentication system uses two different JWTs:

```text
                    Authentication
                          │
              ┌───────────┴───────────┐
              ↓                       ↓
        Access Token            Refresh Token
              │                       │
        Short-lived              Long-lived
              │                       │
      API authentication       Token renewal
              │                       │
        Request header              Cookie
                                      +
                                   Database
```

Each token has a different responsibility.

### Access Token

The access token is used to authenticate normal API requests.

### Refresh Token

The refresh token is used to generate a new access token after the current access token expires.

This separation avoids using a long-lived credential for every API request.

---

# 2. Access Token

The access token is a short-lived JWT.

It is presented by the client when accessing protected endpoints.

For example:

```http
Authorization: Bearer <access-token>
```

The access token contains authentication information required by the application.

The token includes claims such as:

```text
sub
name
email
role
exp
iat
jti
```

Where:

* `sub` identifies the user
* `name` identifies the user's name
* `email` identifies the user's email
* `role` represents the user's authorization role
* `exp` represents the token expiration time
* `iat` represents the time the token was issued
* `jti` uniquely identifies the token

The `jti` is especially important for token revocation.

---

# 3. Why Access Tokens Are Short-Lived

Access tokens are intentionally short-lived.

An access token is sent with many API requests, which means it has more opportunities to be exposed than a refresh token.

If an attacker obtains an access token, the token can potentially be used until it expires.

Therefore:

```text
Short lifetime
      ↓
Smaller attack window
      ↓
Reduced impact of token compromise
```

The system does not rely on the access token remaining valid for a long period.

Instead, the refresh token is used to obtain new access tokens.

---

# 4. Refresh Token

The refresh token is a long-lived JWT used to obtain new access tokens.

It is not intended to be sent with every API request.

Instead, it is used specifically with the refresh-token endpoint.

Conceptually:

```text
Access Token expires
        ↓
Refresh Token
        ↓
New Access Token
+
New Refresh Token
```

This allows users to remain authenticated without repeatedly entering their credentials.

---

# 5. Refresh Token Storage

Refresh tokens are stored in two places:

```text
Refresh Token
     │
     ├── HTTP Cookie
     │
     └── MongoDB
```

### HTTP Cookie

The browser stores the refresh token in an authentication cookie.

The cookie is automatically included when making requests to the appropriate endpoint.

### MongoDB

The server stores the current refresh token associated with the user.

The database copy gives the server the ability to invalidate the refresh session.

This is particularly important during:

* Logout
* Refresh-token rotation
* Session invalidation

---

# 6. Why the Refresh Token Is Stored in the Database

JWTs are normally self-contained.

However, a completely stateless refresh-token system would make server-side invalidation more difficult.

By storing the refresh token in MongoDB, the server can verify that the incoming refresh token is still the currently valid refresh token for the user.

The validation process therefore includes:

```text
Incoming Refresh Token
        ↓
Decode Token
        ↓
Find User
        ↓
Compare Incoming Token
with Stored Token
        ↓
Match?
   ┌────┴────┐
  Yes        No
   ↓          ↓
Continue     Reject
```

This provides server-side control over refresh sessions.

---

# 7. Refresh Token Rotation

Refresh-token rotation is used whenever a refresh operation succeeds.

The existing refresh token is replaced with a newly generated refresh token.

The process is:

```text
Old Refresh Token
        ↓
Verify
        ↓
Generate:
   ├── New Access Token
   └── New Refresh Token
        ↓
Save New Refresh Token
        ↓
Return New Access Token
        +
Set New Refresh Token Cookie
```

The old refresh token should no longer be considered the active refresh token after successful rotation.

This reduces the usefulness of a previously captured refresh token.

---

# 8. Refresh Token Validation

The `/refresh-token` endpoint is protected by the refresh-token verification middleware.

The middleware performs several checks.

### Step 1 — Retrieve Token

The refresh token is retrieved from the authentication cookie.

### Step 2 — Verify JWT

The token signature and validity are verified.

Invalid, malformed, or expired tokens are rejected.

### Step 3 — Decode Token

The token payload is decoded to obtain information such as the user ID.

### Step 4 — Find User

The corresponding user is retrieved from MongoDB.

### Step 5 — Compare Stored Token

The incoming refresh token is compared against the refresh token currently stored for the user.

### Step 6 — Attach Payload

After successful validation, the decoded refresh-token information is attached to the request.

The request can then continue to the controller and service layer.

---

# 9. Refresh Token Expiration

Refresh tokens are long-lived but are not permanent.

Once the refresh token expires, it cannot be used to generate another access token.

The flow becomes:

```text
Expired Refresh Token
        ↓
JWT verification
        ↓
Rejected
        ↓
User must authenticate again
```

This establishes an upper limit for the lifetime of an authentication session.

---

# 10. Access Token Verification

Protected endpoints use the access-token verification middleware.

For example:

```text
GET /api/v1/me
        ↓
verifyAccessToken
        ↓
Controller
        ↓
Response
```

The middleware performs the authentication checks before the request reaches the protected route.

---

# 11. Access Token Retrieval

The access token is retrieved from the request's authorization header.

The expected format is:

```http
Authorization: Bearer <token>
```

The middleware extracts the JWT from the header before verifying it.

If the authorization header or token is missing, the request is rejected.

---

# 12. Access Token Verification Process

The verification process can be represented as:

```text
Incoming Request
       ↓
Read Authorization Header
       ↓
Extract Bearer Token
       ↓
Verify JWT Signature
       ↓
Check Expiration
       ↓
Decode Claims
       ↓
Check Token Blacklist
       ↓
Attach User Information
       ↓
Next Middleware / Controller
```

If any security check fails, the request is rejected.

---

# 13. Access Token Blacklisting

JWT access tokens are normally stateless.

Once issued, the server does not need to store every active access token.

However, logout creates a problem.

Suppose:

```text
Access Token
    ↓
Still valid for 10 minutes
```

The user logs out.

If the server only deletes the refresh token, the existing access token could technically remain valid until its natural expiration.

To solve this, the subsystem maintains a temporary Redis blacklist.

---

# 14. Blacklist Structure

The JWT's `jti` is used as the blacklist identifier.

The Redis key follows the conceptual structure:

```text
blacklist:<jti>
```

The value indicates that the token has been revoked.

For example:

```text
blacklist:550e8400-e29b-41d4-a716-446655440000
    ↓
revoked
```

The access-token middleware checks this key during authentication.

---

# 15. Blacklist Verification

After decoding the access token, the middleware checks Redis:

```javascript
const revoked = await redisClient.get(
    `blacklist:${decodedToken.jti}`
);
```

If the key exists:

```javascript
if (revoked) {
    throw new AppError("Token revoked", 401);
}
```

The request is rejected.

Therefore, logging out can immediately invalidate the current access token.

---

# 16. Blacklist Expiration

Blacklist entries are temporary.

When the token is revoked, the remaining lifetime of the access token is calculated.

Conceptually:

```text
Token expiration
        -
Current time
        =
Remaining lifetime
```

Redis uses this remaining lifetime as the expiration time for the blacklist entry.

Therefore:

```text
Logout
  ↓
Blacklist token
  ↓
Wait until original token expiration
  ↓
Redis automatically removes blacklist entry
```

There is no reason to keep a blacklist entry after the token itself can no longer be valid.

---

# 17. Logout

Logout performs multiple operations.

The request first passes through access-token verification.

```text
Logout Request
      ↓
Verify Access Token
      ↓
Logout Service
      ↓
Remove Refresh Token
      ↓
Blacklist Access Token
      ↓
Clear Authentication Cookie
      ↓
Response
```

The logout service removes the stored refresh token from MongoDB.

Conceptually:

```javascript
await User.findByIdAndUpdate(user._id, {
    $unset: { refreshToken: 1 },
});
```

This prevents the refresh token from being used to establish another access-token session.

---

# 18. Access Token Revocation During Logout

After removing the refresh token, the current access token is blacklisted.

The remaining lifetime of the access token is calculated:

```javascript
const remainingTime =
    user.exp - Math.floor(Date.now() / 1000);
```

The token's `jti` is then stored in Redis with the remaining lifetime.

Conceptually:

```text
blacklist:<jti> = revoked
EX = remaining access-token lifetime
```

This means the access token becomes invalid immediately rather than waiting for its normal expiration.

---

# 19. Clearing Authentication Cookies

After logout, the authentication cookie is cleared from the client.

The complete logout operation therefore invalidates both sides of the authentication session:

```text
Server
 ├── Remove refresh token from MongoDB
 └── Blacklist access token in Redis

Client
 └── Clear refresh-token cookie
```

This ensures that the client no longer retains the refresh credential.

---

# 20. Token Lifecycle

The complete lifecycle of an authentication session is:

```text
                    Login / Registration
                            │
                            ↓
                    Generate Tokens
                            │
             ┌──────────────┴──────────────┐
             ↓                             ↓
       Access Token                  Refresh Token
             │                             │
       Request Header                  Cookie
             │                             │
             ↓                             ↓
       Protected APIs              /refresh-token
             │                             │
             │                      Verify + Rotate
             │                             │
             │                     New Access Token
             │                             +
             │                     New Refresh Token
             │                             │
             └──────────────┬──────────────┘
                            ↓
                          Logout
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
       Blacklist Access Token    Remove Refresh Token
                │                       │
                ↓                       ↓
         Clear after expiry       Clear Cookie
```

---

# 21. Authentication Session Example

Consider a user who has successfully logged in.

The system creates:

```text
Access Token
Refresh Token
```

The access token is returned to the client and used for protected API requests.

The refresh token is stored in the authentication cookie and in MongoDB.

The user then requests:

```text
GET /api/v1/me
```

The request contains:

```http
Authorization: Bearer <access-token>
```

The access-token middleware verifies the token.

If valid, the user's authentication information is attached to the request and the request proceeds.

---

# 22. When the Access Token Expires

The client eventually receives an authentication failure because the access token has expired.

Instead of requiring the user to log in again, the client can call:

```text
POST /api/v1/auth/refresh-token
```

The refresh token is retrieved from the authentication cookie.

The server then:

1. Verifies the refresh token
2. Finds the user
3. Confirms the stored refresh token matches
4. Generates a new access token
5. Generates a new refresh token
6. Stores the new refresh token
7. Replaces the refresh-token cookie
8. Returns the new access token

The user can then continue making authenticated requests.

---

# 23. Why Two Tokens Are Used

Using only an access token creates a trade-off.

If the token is long-lived, a stolen token remains useful for a long time.

If the token is short-lived, users have to authenticate frequently.

The dual-token model solves this:

```text
Short-lived Access Token
        +
Long-lived Refresh Token
        ↓
Security + User Convenience
```

The access token limits the attack window, while the refresh token maintains the session.

---

# 24. Security Trade-Off of Refresh Tokens

Refresh tokens are more sensitive because they are long-lived.

If a refresh token is compromised, an attacker may be able to generate new access tokens until the refresh session expires or is invalidated.

The subsystem therefore provides several controls:

* Refresh token stored server-side
* Refresh token stored in an authentication cookie
* Refresh token rotation
* Refresh token comparison against the stored value
* Server-side removal during logout
* Expiration

These controls reduce the usefulness of compromised refresh credentials.

---

# 25. Token Security Model

The token security model can be summarized as:

```text
Access Token
├── Short lifetime
├── JWT signature
├── User claims
├── Unique jti
├── Sent with authenticated requests
└── Redis blacklist support

Refresh Token
├── Long lifetime
├── JWT signature
├── Stored in authentication cookie
├── Stored in MongoDB
├── Compared against stored value
├── Rotated after refresh
└── Invalidated during logout
```

---

# 26. Token Management Principles

The subsystem follows these principles:

### Minimize Credential Lifetime

Access tokens are short-lived.

### Separate Authentication Credentials

Access and refresh tokens have different responsibilities.

### Keep Long-Lived Credentials Under Server Control

Refresh tokens are stored server-side so that sessions can be invalidated.

### Rotate Refresh Tokens

A successful refresh produces a new refresh token.

### Support Immediate Access-Token Revocation

Redis blacklisting allows logout to invalidate an otherwise valid access token.

### Automatically Remove Temporary Revocation Data

Blacklist entries expire when the corresponding access token expires.

### Never Treat JWTs as Automatically Revocable

JWTs are self-contained credentials. Explicit revocation mechanisms are required when immediate invalidation is necessary.

---

# 27. Summary

The token-management system is built around a short-lived access token and a long-lived refresh token.

The access token provides normal API authentication while the refresh token maintains the user's authentication session.

The overall model is:

```text
Login / Registration
        ↓
Access + Refresh Tokens
        ↓
Access Token → Protected APIs
        ↓
Access Token expires
        ↓
Refresh Token → New Access + Refresh Tokens
        ↓
Logout
        ↓
Access Token → Redis Blacklist
Refresh Token → Removed from MongoDB
Cookie → Cleared
```

This design provides a balance between security, session persistence, server-side control, and usability while keeping token management isolated from the application's broader business logic.
