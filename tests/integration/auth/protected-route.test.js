// Configs
import request from "supertest";
import app from "../../../src/app.js";
import { describe, test, expect } from "@jest/globals";

// Helpers
import { createAuthenticatedUser } from "../../helper/authenticatedUser.helper.js";

describe("Protected routes", () => {
    test("Should access /me with valid token", async () => {
        const { user, accessToken } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/v1/me")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.email).toBe(user.email.toLowerCase());
    });

    test("Should reject /me with invalid token", async () => {
        const response = await request(app)
            .get("/api/v1/me")
            .set("Authorization", "Bearer InvalidToken");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject /me without token", async () => {
        const response = await request(app).get("/api/v1/me");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject /me without Bearer prefix", async () => {
        const { accessToken } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/v1/me")
            .set("Authorization", accessToken);

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should remove refresh token after logout", async () => {
        const { accessToken, agent } = await createAuthenticatedUser();

        const logoutResponse = await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(logoutResponse.statusCode).toBe(200);
        expect(logoutResponse.headers["set-cookie"][0]).toContain(
            "refreshToken"
        );
    });
});
