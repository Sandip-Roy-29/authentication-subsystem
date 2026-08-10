const schemas = {
    User: {
        type: "object",

        required: ["id", "name", "email", "role"],

        properties: {
            id: {
                type: "string",
                description: "Unique identifier of the user",
                example: "64f1a2b3c4d5e6f789012345",
            },

            name: {
                type: "string",
                description: "User's display name",
                example: "Sandip Roy",
            },

            email: {
                type: "string",
                format: "email",
                description: "User's email address",
                example: "sandip@example.com",
            },

            role: {
                type: "string",
                enum: ["user", "admin"],
                description: "User's authorization role",
                example: "user",
            },
        },
    },

    ApiError: {
        type: "object",

        properties: {
            success: {
                type: "boolean",
                example: false,
            },

            message: {
                type: "string",
                example: "Invalid credentials",
            },

            statusCode: {
                type: "integer",
                example: 401,
            },

            error: {
                type: "object",

                properties: {
                    type: {
                        type: "string",
                        example: "AppError",
                    },
                },
            },

            timestamp: {
                type: "string",
                format: "date-time",
            },

            requestId: {
                type: ["string", "null"],
                example: "req_abc123",
            },
        },
    },

    AuthenticatedUser: {
        type: "object",

        properties: {
            id: {
                type: "string",
                example: "64f1a2b3c4d5e6f789012345",
            },

            name: {
                type: "string",
                example: "Sandip Roy",
            },

            email: {
                type: "string",
                format: "email",
                example: "sandip@example.com",
            },

            role: {
                type: "string",
                enum: ["user", "admin"],
                example: "user",
            },

            accessToken: {
                type: "string",
                description: "JWT access token",
                example: "eyJhbGciOiJIUzI1NiIs...",
            },
        },
    },

    ApiResponse: {
        type: "object",

        required: [
            "statusCode",
            "message",
            "data",
            "success",
            "meta",
            "requestId",
            "timestamp",
        ],

        properties: {
            statusCode: {
                type: "integer",
                example: 200,
            },

            message: {
                type: "string",
                example: "Success",
            },

            data: {
                description: "Response payload",
            },

            success: {
                type: "boolean",
                example: true,
            },

            meta: {
                type: "object",
                example: {},
            },

            requestId: {
                type: ["string", "null"],
                example: "req_abc123",
            },

            timestamp: {
                type: "string",
                format: "date-time",
                example: "2026-08-10T04:30:00.000Z",
            },
        },
    },

    VerifyEmailRequest: {
        type: "object",

        required: ["email", "otp"],

        properties: {
            email: {
                type: "string",
                format: "email",
                description: "Email address used during registration",
                example: "sandip@example.com",
            },

            otp: {
                type: "string",
                pattern: "^\\d{6}$",
                description: "Six-digit email verification OTP",
                example: "123456",
            },
        },
    },

    LoginRequest: {
        type: "object",

        required: ["email", "password"],

        properties: {
            email: {
                type: "string",
                format: "email",
                description: "User's email address",
                example: "sandip@example.com",
            },

            password: {
                type: "string",
                format: "password",
                minLength: 8,
                maxLength: 128,
                description: "User's account password",
                example: "Password@123",
            },
        },
    },

    RefreshTokenResponse: {
        type: "object",

        required: ["id", "email", "accessToken"],

        properties: {
            id: {
                type: "string",
                example: "64f1a2b3c4d5e6f789012345",
            },

            email: {
                type: "string",
                format: "email",
                example: "sandip@example.com",
            },

            accessToken: {
                type: "string",
                description: "New JWT access token",
                example: "eyJhbGciOiJIUzI1NiIs...",
            },
        },
    },

    UpdateUserRoleRequest: {
        type: "object",

        required: ["role"],

        properties: {
            role: {
                type: "string",
                enum: ["user", "admin"],
                description: "New role assigned to the user",
                example: "admin",
            },
        },
    },

    RegisterRequest: {
        type: "object",

        required: ["name", "email", "password"],

        properties: {
            name: {
                type: "string",
                minLength: 3,
                maxLength: 50,
                example: "John Doe",
            },

            email: {
                type: "string",
                format: "email",
                example: "john@example.com",
            },

            password: {
                type: "string",
                format: "password",
                minLength: 8,
                maxLength: 128,
                example: "Password@123",
                pattern:
                    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._-])[A-Za-z\\d@$!%*?&._-]{8,}$",
            },
        },
    },

    ResendVerificationRequest: {
        type: "object",

        required: ["email"],

        properties: {
            email: {
                type: "string",
                format: "email",
                description:
                    "Email address to resend the verification email to",
                example: "sandip@example.com",
            },
        },
    },

    ResetPasswordRequest: {
        type: "object",

        required: ["email", "otp", "password"],

        properties: {
            email: {
                type: "string",
                format: "email",
                example: "sandip@example.com",
            },

            otp: {
                type: "string",
                pattern: "^\\d{6}$",
                description: "Six-digit password reset OTP",
                example: "123456",
            },

            password: {
                type: "string",
                format: "password",
                minLength: 8,
                maxLength: 128,
                description: "New account password",
                example: "NewPassword@123",
            },
        },
    },

    GoogleLoginRequest: {
        type: "object",

        required: ["idToken"],

        properties: {
            idToken: {
                type: "string",
                description: "Google-issued ID token",
                example: "eyJhbGciOiJSUzI1NiIs...",
            },
        },
    },

    HealthResponse: {
        type: "object",

        required: ["success", "server", "database"],

        properties: {
            success: {
                type: "boolean",
                example: true,
            },

            server: {
                type: "string",
                example: "running",
            },

            database: {
                type: "string",
                enum: ["Connected", "Disconnected"],
                example: "Connected",
            },
        },
    },

    CurrentUser: {
        type: "object",

        required: ["id", "email", "role"],

        properties: {
            id: {
                type: "string",
                description: "Unique identifier of the user",
                example: "64f1a2b3c4d5e6f789012345",
            },

            email: {
                type: "string",
                format: "email",
                description: "User's email address",
                example: "sandip@example.com",
            },

            role: {
                type: "string",
                enum: ["user", "admin"],
                description: "User's authorization role",
                example: "user",
            },
        },
    },
};

export default schemas;
