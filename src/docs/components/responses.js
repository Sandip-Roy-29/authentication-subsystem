const responses = {
    BadRequest: {
        description: "Bad request",

        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/ApiError",
                },
            },
        },
    },

    Unauthorized: {
        description: "Authentication failed or access token is invalid",

        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/ApiError",
                },
            },
        },
    },

    Forbidden: {
        description: "Insufficient permissions",

        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/ApiError",
                },
            },
        },
    },

    NotFound: {
        description: "Resource not found",

        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/ApiError",
                },
            },
        },
    },

    TooManyRequests: {
        description: "Too many requests",

        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/ApiError",
                },
            },
        },
    },

    InternalServerError: {
        description: "Internal server error",

        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/ApiError",
                },
            },
        },
    },

    AlreadyExist: {
        description: "User already exists",

        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/ApiError",
                },
            },
        },
    },
};

export default responses;
