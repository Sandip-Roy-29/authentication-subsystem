import request from "supertest";
import { describe, test, expect, beforeEach } from "@jest/globals";

import redisClient from "#infra/redis/redis.client.js";

import { sendMailMock } from "../../mocks/transporter.mock.js";
import { createPendingVerification } from "../../helper/createPendingVerification.helper.js";
import app from "../../helper/createTestApp.helper.js";


describe("Resend verification route", () => {
    beforeEach(() => {
        sendMailMock.mockClear();
    });

    test("Should resend verification email", async () => {
        const { user } = await createPendingVerification();

        sendMailMock.mockClear();        

        await redisClient.del(
            `email-verification-cooldown:${user.email}`
        );
        
        const response = await request(app)
            .post("/api/v1/auth/resend-verification")
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
            .post("/api/v1/auth/resend-verification")
            .send({
                email: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject expired verification", async () => {
        const { user } = await createPendingVerification();

        await redisClient.del(
            `email-verification:${user.email}`
        );

        await redisClient.del(
            `email-verification-cooldown:${user.email}`
        );

        const response = await request(app)
            .post("/api/v1/auth/resend-verification")
            .send({
                email: user.email,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject resend during cooldown", async () => {
        const { user } = await createPendingVerification();

        const response = await request(app)
            .post("/api/v1/auth/resend-verification")
            .send({
                email: user.email,
            });

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
    });

    test("Should generate a new OTP", async () => {
        const { user, otp: oldOtp } =
            await createPendingVerification();

        await redisClient.del(
            `email-verification-cooldown:${user.email}`
        );

        await request(app)
            .post("/api/v1/auth/resend-verification")
            .send({
                email: user.email,
            });

        const pending = JSON.parse(
            await redisClient.get(
                `email-verification:${user.email}`
            )
        );

        expect(pending.otp).not.toBe(oldOtp);
    });

    test("Should preserve pending user information", async () => {
        const { user } = await createPendingVerification();

        const original = JSON.parse(
            await redisClient.get(
                `email-verification:${user.email}`
            )
        );

        await redisClient.del(
            `email-verification-cooldown:${user.email}`
        );

        await request(app)
            .post("/api/v1/auth/resend-verification")
            .send({
                email: user.email,
            });

        const updated = JSON.parse(
            await redisClient.get(
                `email-verification:${user.email}`
            )
        );

        expect(updated.name).toBe(original.name);
        expect(updated.email).toBe(original.email);
        expect(updated.password).toBe(original.password);
        expect(updated.role).toBe(original.role);

        expect(updated.otp).not.toBe(original.otp);
    });

    test("Should reset OTP expiration", async () => {
        const { user } = await createPendingVerification();

        await redisClient.del(
            `email-verification-cooldown:${user.email}`
        );

        await request(app)
            .post("/api/v1/auth/resend-verification")
            .send({
                email: user.email,
            });

        const ttl = await redisClient.ttl(
            `email-verification:${user.email}`
        );

        expect(ttl).toBeGreaterThan(590);
    });

    test("Should recreate cooldown", async () => {
        const { user } = await createPendingVerification();

        await redisClient.del(
            `email-verification-cooldown:${user.email}`
        );

        await request(app)
            .post("/api/v1/auth/resend-verification")
            .send({
                email: user.email,
            });

        expect(
            await redisClient.get(
                `email-verification-cooldown:${user.email}`
            )
        ).toBe("1");

        const ttl = await redisClient.ttl(
            `email-verification-cooldown:${user.email}`
        );

        expect(ttl).toBeGreaterThan(50);
    });
});