import request from "supertest";
import { describe, test, expect } from "@jest/globals";
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";
import app from "../../helper/createTestApp.helper.js";


describe("Protected routes", () => {
    test("Should access /me with valid token", async () => {
        const { user, accessToken } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/v1/me")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.id).toBe(user.id);
        expect(response.body.data.email).toBe(user.email.toLowerCase());
        expect(response.body.data.role).toBe(user.role);
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

    test("Should reject access token after logout", async () => {
        const { accessToken, agent } = await createAuthenticatedUser();

        const logoutResponse = await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(logoutResponse.statusCode).toBe(200);

        const response = await request(app)
            .get("/api/v1/me")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });
});