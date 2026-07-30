import request from "supertest";
import app from "../../../src/app.js";
import { describe, test, expect } from "@jest/globals";

import { createUserPayload } from "../../helper/createUserPayload.helper.js";
import { sendMailMock } from "../../mocks/transporter.mock.js";
import redisClient from "#infra/redis/redis.client.js";
import { createAuthenticatedAdmin } from "../../helper/createAuthenticatedAdmin.helper.js";
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";

describe("Admin register route", () => {
    test("Should allow an admin to create an admin registration request", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();

        const user = createUserPayload();

        const response = await agent
            .post("/api/v1/auth/admin/register")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(user);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: user.email,
                subject: expect.stringContaining("Verify"),
            })
        );
    });

    test("Should reject when not logged in", async () => {
        const response = await request(app)
            .post("/api/v1/auth/admin/register")
            .send(createUserPayload());

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject a normal user", async () => {
        const { agent, accessToken } = await createAuthenticatedUser();

        const response = await agent
            .post("/api/v1/auth/admin/register")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(createUserPayload());

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test("Should create a pending admin registration", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();

        const user = createUserPayload();

        const response = await agent
            .post("/api/v1/auth/admin/register")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(user);

        expect(response.statusCode).toBe(200);

        expect(sendMailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: user.email,
            })
        );

        const pending = JSON.parse(
            await redisClient.get(`email-verification:${user.email}`)
        );

        expect(pending.role).toBe("admin");
    });

    test("Should reject duplicate verification requests during cooldown", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();

        const user = createUserPayload();

        await agent
            .post("/api/v1/auth/admin/register")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(user);

        const response = await agent
            .post("/api/v1/auth/admin/register")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(user);

        expect(response.statusCode).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("pending");
    });
});
