import responses from "./components/responses.js";
import schemas from "./components/schemas.js";
import securitySchemes from "./components/security.js";
import tags from "./components/tags.js";
import authPaths from "./paths/auth.js";
import healthPaths from "./paths/health.js";
import userPaths from "./paths/user.js";

const openapiSpecification = {
    openapi: "3.1.0",

    info: {
        title: "Authentication Subsystem API",
        version: "1.0.0",
        description:
            "REST API for user authentication, authorization, account verification, password recovery, and user management.",

        contact: {
            name: "Sandip Roy",
        },

        license: {
            name: "MIT",
        },
    },

    tags,

    servers: [
        {
            url: "http://localhost:8000",
            description: "Local development server",
        },
    ],

    paths: {
        ...healthPaths,
        ...authPaths,
        ...userPaths,
    },

    components: {
        schemas,
        securitySchemes,
        responses,
    },
};

export default openapiSpecification;
