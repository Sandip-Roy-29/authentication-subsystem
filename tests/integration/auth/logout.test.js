import request from "supertest";
import { describe, test, expect } from "@jest/globals";

import { User } from "#modules/user/models/user.model.js";
import redisClient from "#infra/redis/redis.client.js";
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";
import app from "../../helper/createTestApp.helper.js";

describe("Logout route", () => {
    test("Should logout successfully", async () => {
        const { agent, accessToken } = await createAuthenticatedUser();

        const response = await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test("Should reject when not authenticated", async () => {
        const response = await request(app).post("/api/v1/auth/logout");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should remove refresh token from database", async () => {
        const { agent, userId, accessToken } = await createAuthenticatedUser();

        await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        const user = await User.findById(userId).select("+refreshToken.token");

        expect(user.refreshToken.token).toBeUndefined();
        expect(user.refreshToken.expiresAt).toBeUndefined();
    });

    test("Should blacklist the access token", async () => {
        const { agent, accessToken } = await createAuthenticatedUser();

        const response = await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);

        const [, payload] = accessToken.split(".");
        const decoded = JSON.parse(
            Buffer.from(payload, "base64url").toString()
        );

        expect(await redisClient.get(`blacklist:${decoded.jti}`)).toBe(
            "revoked"
        );
    });

    test("Should clear refresh token cookie", async () => {
        const { agent, accessToken } = await createAuthenticatedUser();

        const response = await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("refreshToken=")])
        );
    });
});
