const healthPaths = {
    "/health": {
        get: {
            tags: ["Health"],
            summary: "Check API health",
            description:
                "Returns the health status of the application and database.",
            responses: {
                200: {
                    description: "Application and database are healthy",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/HealthResponse",
                            },
                        },
                    },
                },
                503: {
                    description: "Database is disconnected",

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/HealthResponse",
                            },
                        },
                    },
                },
            },
        },
    },
};

export default healthPaths;
