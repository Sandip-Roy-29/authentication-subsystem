// Configs
import { describe, test, expect } from "@jest/globals";
import env from "../../../src/config/env.config.js";

// Helpers
import { createUserPayload } from "../../helper/createUserPayload.helper.js";
import { registerUser } from "../../helper/registerUser.helper.js";
import { loginUser } from "../../helper/loginUser.helper.js";
import { createAuthenticatedUser } from "../../helper/authenticatedUser.helper.js";

describe("Rate Limit", () => {
    test("should reject register requests after the configured limit is exceeded", async () => {
        for (let i = 1; i <= env.REGISTER_RATE_LIMIT_MAX; i++) {
            const user = createUserPayload();
            const response = await registerUser(user);

            expect(response.statusCode).toBe(201);
        }
        const user = createUserPayload();
        const response = await registerUser(user);

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Too many requests. Please try again in 15 minutes."
        );
    });

    test("should reject login requests after the configured limit is exceeded", async () => {
        const user = createUserPayload();
        await registerUser(user);

        for (let i = 1; i <= env.LOGIN_RATE_LIMIT_MAX; i++) {
            const response = await loginUser(user);

            expect(response.statusCode).toBe(200);
            expect(response.headers["ratelimit-limit"]).toBeDefined();
            expect(response.headers["ratelimit-remaining"]).toBeDefined();
            expect(response.headers["ratelimit-reset"]).toBeDefined();
        }
        const response = await loginUser(user);

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Too many requests. Please try again in 15 minutes."
        );
    });

    test("should reject refresh token requests after the configured limit is exceeded", async () => {
        const { agent } = await createAuthenticatedUser();

        for (let i = 1; i <= env.REFRESH_RATE_LIMIT_MAX; i++) {
            const response = await agent.post("/api/v1/refresh-token");

            expect(response.statusCode).toBe(200);
        }
        const response = await agent.post("/api/v1/refresh-token");

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Too many requests. Please try again in 15 minutes."
        );
    });

    test("should allow requests again after rate limit window resets", async () => {
        const user = createUserPayload();

        await registerUser(user);

        await loginUser(user);
        await loginUser(user);

        const blockedResponse = await loginUser(user);

        expect(blockedResponse.statusCode).toBe(429);

        await new Promise((resolve) => {
            setTimeout(resolve, 1100);
        });

        const allowedResponse = await loginUser(user);

        expect(allowedResponse.statusCode).toBe(200);
    });
});
