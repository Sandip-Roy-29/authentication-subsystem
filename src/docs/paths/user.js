const userPaths = {
    "/api/v1/me": {
        get: {
            tags: ["Users"],
            summary: "Get current user",
            description:
                "Returns the currently authenticated user's information.",

            security: [
                {
                    bearerAuth: [],
                },
            ],

            responses: {
                200: {
                    description: "Current user retrieved successfully",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CurrentUser",
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

    "/api/v1/users": {
        get: {
            tags: ["Users"],
            summary: "Get all users",
            description:
                "Returns all users. Requires a valid access token and the admin role.",

            security: [
                {
                    bearerAuth: [],
                },
            ],

            responses: {
                200: {
                    description: "Users retrieved successfully",

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
                                                type: "array",
                                                items: {
                                                    $ref: "#/components/schemas/User",
                                                },
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

                403: {
                    description: "Admin role required",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Forbidden",
                            },
                        },
                    },
                },

                404: {
                    description: "User not found",

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

    "/api/v1/users/{userId}": {
        delete: {
            tags: ["Users"],
            summary: "Delete a user",
            description:
                "Deletes a user by ID. Requires a valid access token and the admin role.",

            security: [
                {
                    bearerAuth: [],
                },
            ],

            parameters: [
                {
                    name: "userId",
                    in: "path",
                    required: true,
                    description: "ID of the user to delete",
                    schema: {
                        type: "string",
                    },
                    example: "64f1a2b3c4d5e6f789012345",
                },
            ],

            responses: {
                200: {
                    description: "User deleted successfully",

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
                    description: "Admin attempted to delete their own account",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Forbidden",
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

                403: {
                    description: "Admin role required",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Forbidden",
                            },
                        },
                    },
                },

                404: {
                    description: "User not found",

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

    "/api/v1/users/{userId}/role": {
        patch: {
            tags: ["Users"],
            summary: "Update user role",
            description:
                "Updates a user's role. Requires a valid access token and the admin role.",

            security: [
                {
                    bearerAuth: [],
                },
            ],

            parameters: [
                {
                    name: "userId",
                    in: "path",
                    required: true,
                    description: "ID of the user whose role will be updated",
                    schema: {
                        type: "string",
                    },
                    example: "64f1a2b3c4d5e6f789012345",
                },
            ],

            requestBody: {
                required: true,

                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UpdateUserRoleRequest",
                        },
                    },
                },
            },

            responses: {
                200: {
                    description: "User role updated successfully",

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
                                                $ref: "#/components/schemas/User",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },

                400: {
                    description: "Admin attempted to change their own role",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Forbidden",
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

                403: {
                    description: "Admin role required",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/responses/Forbidden",
                            },
                        },
                    },
                },

                404: {
                    description: "User not found",

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
};

export default userPaths;
