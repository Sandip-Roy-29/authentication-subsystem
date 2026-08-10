const authPaths = {
    "/api/v1/auth/register": {
        post: {
            tags: ["Authentication"],
            summary: "Register a new user",
            description:
                "Starts the user registration process by sending a verification email.",

            requestBody: {
                required: true,

                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RegisterRequest",
                        },
                    },
                },
            },

            responses: {
                200: {
                    description: "Verification email sent successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "null",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
                409: {
                    description: "User already exists",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/AlreadyExist",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/v1/auth/verify-email": {
        post: {
            tags: ["Authentication"],
            summary: "Verify user email",
            description:
                "Verifies the user's email address using the OTP sent during registration.",

            requestBody: {
                required: true,

                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/VerifyEmailRequest",
                        },
                    },
                },
            },

            responses: {
                201: {
                    description: "User registered successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",

                                        properties: {
                                            data: {
                                                $ref: "#/components/schemas/AuthenticatedUser",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
                409: {
                    description: "User already exists",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/AlreadyExist",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/v1/auth/login": {
        post: {
            tags: ["Authentication"],
            summary: "Log in a user",
            description:
                "Authenticates a user using their email and password and returns an access token.",

            requestBody: {
                required: true,

                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/LoginRequest",
                        },
                    },
                },
            },

            responses: {
                200: {
                    description: "User logged in successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",

                                        properties: {
                                            data: {
                                                $ref: "#/components/schemas/AuthenticatedUser",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },

                400: {
                    description: "Invalid request data",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/BadRequest",
                            },
                        },
                    },
                },

                401: {
                    description: "Invalid email or password",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Unauthorized",
                            },
                        },
                    },
                },

                429: {
                    description: "Too many login attempts",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/TooManyRequests",
                            },
                        },
                    },
                },
                
                403: {
                    description: "Verify email before logging in",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Forbidden",
                            },
                        },
                    },
                },
                
                404: {
                    description: "User does not exist",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/NotFound",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/v1/auth/refresh-token": {
        post: {
            tags: ["Authentication"],
            summary: "Refresh access token",
            description:
                "Generates a new access token using the refresh token stored in an HTTP-only cookie.",

            security: [
                {
                    refreshCookie: [],
                },
            ],

            responses: {
                200: {
                    description: "Access token generated successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                $ref: "#/components/schemas/RefreshTokenResponse",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },

                401: {
                    description: "Invalid or expired refresh token",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Unauthorized",
                            },
                        },
                    },
                },

                404: {
                    description: "User does not exist",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/NotFound",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/v1/auth/logout": {
        post: {
            tags: ["Authentication"],
            summary: "Log out user",
            description:
                "Logs out the authenticated user and clears authentication cookies.",

            security: [
                {
                    bearerAuth: [],
                },
            ],

            responses: {
                200: {
                    description: "User logged out successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "null",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },

                401: {
                    description: "Authentication required",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Unauthorized",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/v1/auth/admin/register": {
        post: {
            tags: ["Authentication"],
            summary: "Register a new user",
            description:
                "Registers a new user with administrative privileges. Requires an authenticated administrator.",

            security: [
                {
                    bearerAuth: [],
                },
            ],

            requestBody: {
                required: true,

                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RegisterRequest",
                        },
                    },
                },
            },

            responses: {
                200: {
                    description: "Verification email sent successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "null",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },

                409: {
                    description: "User already exists",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/AlreadyExist",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/v1/auth/resend-verification": {
        post: {
            tags: ["Authentication"],
            summary: "Resend verification email",
            description:
                "Resends the email verification OTP to the specified email address.",

            requestBody: {
                required: true,

                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ResendVerificationRequest",
                        },
                    },
                },
            },

            responses: {
                200: {
                    description: "Verification email sent successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "null",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },

                400: {
                    description: "Invalid request",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/BadRequest",
                            },
                        },
                    },
                },

                429: {
                    description: "Too many verification requests",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/TooManyRequests",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/v1/auth/forgot-password": {
        post: {
            tags: ["Authentication"],
            summary: "Request password reset",
            description:
                "Sends a password reset OTP to the user's email address.",

            requestBody: {
                required: true,

                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ResendVerificationRequest",
                        },
                    },
                },
            },

            responses: {
                200: {
                    description: "Password reset code sent successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "null",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },

                400: {
                    description: "Invalid request",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/BadRequest",
                            },
                        },
                    },
                },

                429: {
                    description: "Too many password reset requests",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/TooManyRequests",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/v1/auth/reset-password": {
        post: {
            tags: ["Authentication"],
            summary: "Reset password",
            description:
                "Resets the user's password using the OTP sent to their email.",

            requestBody: {
                required: true,

                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ResetPasswordRequest",
                        },
                    },
                },
            },

            responses: {
                200: {
                    description: "Password reset successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "null",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },

                400: {
                    description: "Invalid or expired OTP",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/BadRequest",
                            },
                        },
                    },
                },

                429: {
                    description: "Too many password reset attempts",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/TooManyRequests",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/v1/auth/google": {
        post: {
            tags: ["Authentication"],
            summary: "Log in with Google",
            description: "Authenticates a user using a Google ID token.",

            requestBody: {
                required: true,

                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/GoogleLoginRequest",
                        },
                    },
                },
            },

            responses: {
                200: {
                    description: "User logged in successfully",

                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/ApiResponse",
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                $ref: "#/components/schemas/AuthenticatedUser",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },

                401: {
                    description: "Invalid Google ID token",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Unauthorized",
                            },
                        },
                    },
                },

                429: {
                    description: "Too many Google login attempts",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/TooManyRequests",
                            },
                        },
                    },
                },
            },
        },
    },
};

export default authPaths;
