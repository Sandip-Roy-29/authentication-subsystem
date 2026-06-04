// Configs
import request from "supertest";
import app from "../../../src/app.js";
import { describe, test, expect } from "@jest/globals";
import jwt from "jsonwebtoken";
import env from "../../../src/config/env.config.js";
import redisClient from "../../../src/config/redis.config.js";

// Helpers
import { createAuthenticatedUser } from "../../helper/authenticatedUser.helper.js";

describe("Refresh token route", () => {
    test("Should generate new access token", async () => {
        const { accessToken, agent } = await createAuthenticatedUser();

        const response = await agent.post("/api/v1/refresh-token");

        const newAccessToken = response.body.data.accessToken;

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("accessToken");

        expect(newAccessToken).not.toBe(accessToken);
    });

    test("Should not generate new access token with invalid refresh token", async () => {
        await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/v1/refresh-token")
            .set("Cookie", ["refreshToken=InvalidRefreshToken"]);

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should not generate new access token without refresh token", async () => {
        const response = await request(app).post("/api/v1/refresh-token");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should rotate refresh token", async () => {
        const { agent } = await createAuthenticatedUser();

        const response1 = await agent.post("/api/v1/refresh-token");

        const oldCookie = response1.headers["set-cookie"][0];

        const response2 = await agent.post("/api/v1/refresh-token");

        const newCookie = response2.headers["set-cookie"][0];

        expect(response2.statusCode).toBe(200);
        expect(response2.body.success).toBe(true);

        expect(oldCookie).not.toBe(newCookie);
    });

    test("Should reject old refresh token after rotation", async () => {
        const { agent } = await createAuthenticatedUser();

        const response1 = await agent.post("/api/v1/refresh-token");

        const oldRefreshCookie =
            response1.headers["set-cookie"][0].split(";")[0];

        const response2 = await agent.post("/api/v1/refresh-token");

        expect(response2.statusCode).toBe(200);

        const response3 = await request(app)
            .post("/api/v1/refresh-token")
            .set("Cookie", oldRefreshCookie);

        expect(response3.statusCode).toBe(401);
        expect(response3.body.success).toBe(false);
    });

    test("Should reject refresh token after logout", async () => {
        const { accessToken, agent } = await createAuthenticatedUser();

        const logoutResponse = await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(logoutResponse.statusCode).toBe(200);

        const refreshResponse = await agent.post("/api/v1/refresh-token");

        expect(refreshResponse.statusCode).toBe(401);
        expect(refreshResponse.body.success).toBe(false);
    });

    test("Should revoke access token after logout", async () => {
        const { accessToken, agent } = await createAuthenticatedUser();

        const logoutResponse = await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(logoutResponse.statusCode).toBe(200);

        const response = await request(app)
            .get("/api/v1/me")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(401);
    });

    test("Should blacklist access token jti", async () => {
        const { accessToken, agent } = await createAuthenticatedUser();

        const logoutResponse = await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(logoutResponse.statusCode).toBe(200);

        const decodedToken = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);

        const value = await redisClient.get(`blacklist:${decodedToken.jti}`);

        expect(value).toBe("revoked");
    });
});
