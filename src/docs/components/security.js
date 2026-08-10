const securitySchemes = {
    bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
            "JWT access token returned by the login, registration, Google login, or refresh-token endpoints.",
    },
    refreshCookie: {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
        description:
            "HTTP-only refresh token cookie used to obtain a new access token.",
    },
};

export default securitySchemes;
