import request from "supertest";
import { describe, test, expect, beforeEach } from "@jest/globals";

import redisClient from "#infra/redis/redis.client.js";
import { sendMailMock } from "../../mocks/transporter.mock.js";
import { createUser } from "../../helper/createUser.helper.js";
import app from "../../helper/createTestApp.helper.js";

describe("Forgot password route", () => {
    beforeEach(() => {
        sendMailMock.mockClear();
    });

    test("Should send password reset OTP", async () => {
        const user = await createUser();

        const response = await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({
                email: user.email,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        expect(sendMailMock).toHaveBeenCalledTimes(1);

        expect(sendMailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: user.email,
            })
        );
    });

    test("Should reject without email", async () => {
        const response = await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({
                email: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject unknown email", async () => {
        const response = await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({
                email: "unknown@gmail.com",
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("Should reject duplicate request during cooldown", async () => {
        const user = await createUser();

        await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({
                email: user.email,
            });

        const response = await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({
                email: user.email,
            });

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
    });

    test("Should store password reset OTP in Redis", async () => {
        const user = await createUser();

        await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({
                email: user.email,
            });

        const pending = JSON.parse(
            await redisClient.get(`password-reset:${user.email}`)
        );

        expect(pending).toBeDefined();
        expect(pending.userId.toString()).toBe(user._id.toString());
        expect(pending.otp).toBeDefined();
    });

    test("Should set password reset OTP expiration", async () => {
        const user = await createUser();

        await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({
                email: user.email,
            });

        const ttl = await redisClient.ttl(
            `password-reset:${user.email}`
        );

        expect(ttl).toBeGreaterThan(590);
    });

    test("Should create cooldown key", async () => {
        const user = await createUser();

        await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({
                email: user.email,
            });

        expect(
            await redisClient.get(
                `password-reset-cooldown:${user.email}`
            )
        ).toBe("1");

        const ttl = await redisClient.ttl(
            `password-reset-cooldown:${user.email}`
        );

        expect(ttl).toBeGreaterThan(50);
    });
});