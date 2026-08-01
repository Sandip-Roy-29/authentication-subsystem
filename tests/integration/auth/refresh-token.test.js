import request from "supertest";
import { describe, test, expect } from "@jest/globals";

import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";
import { User } from "#modules/user/models/user.model.js";
import app from "../../helper/createTestApp.helper.js";

describe("Refresh token route", () => {
    test("Should refresh access token", async () => {
        const { agent, accessToken, userId } = await createAuthenticatedUser();

        const response = await agent.post("/api/v1/auth/refresh-token");

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data).toEqual(
            expect.objectContaining({
                id: userId,
                email: expect.any(String),
                accessToken: expect.any(String),
            })
        );

        expect(response.body.data.accessToken).not.toBe(accessToken);
    });

    test("Should issue a new refresh token cookie", async () => {
        const { agent } = await createAuthenticatedUser();

        const response = await agent.post("/api/v1/auth/refresh-token");

        expect(response.statusCode).toBe(200);

        expect(response.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("refreshToken=")])
        );
    });

    test("Should reject when refresh token is missing", async () => {
        const response = await request(app).post("/api/v1/auth/refresh-token");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject an invalid refresh token", async () => {
        const response = await request(app)
            .post("/api/v1/auth/refresh-token")
            .set("Cookie", ["refreshToken=invalid-token"]);

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should rotate refresh token", async () => {
        const { agent, cookies } = await createAuthenticatedUser();

        const oldCookie = cookies.find((cookie) =>
            cookie.startsWith("refreshToken=")
        );

        const response = await agent.post("/api/v1/auth/refresh-token");

        const newCookie = response.headers["set-cookie"].find((cookie) =>
            cookie.startsWith("refreshToken=")
        );

        expect(newCookie).toBeDefined();
        expect(newCookie).not.toEqual(oldCookie);
    });

    test("Should reject the old refresh token after rotation", async () => {
        const { agent, cookies } = await createAuthenticatedUser();

        const oldCookie = cookies.find((cookie) =>
            cookie.startsWith("refreshToken=")
        );

        const refreshResponse = await agent.post("/api/v1/auth/refresh-token");

        expect(refreshResponse.statusCode).toBe(200);

        const response = await request(app)
            .post("/api/v1/auth/refresh-token")
            .set("Cookie", [oldCookie]);

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject an expired refresh token", async () => {
        const { agent, userId } = await createAuthenticatedUser();

        await User.findByIdAndUpdate(userId, {
            $set: {
                "refreshToken.expiresAt": new Date(Date.now() - 1000),
            },
        });

        const response = await agent.post("/api/v1/auth/refresh-token");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Expired refresh token");
    });
});
