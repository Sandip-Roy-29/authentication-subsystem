import request from "supertest";
import { describe, test, expect, beforeEach } from "@jest/globals";

import env from "#env";
import redisClient from "#infra/redis/redis.client.js";

import { createUserPayload } from "../../helper/createUserPayload.helper.js";
import { createPendingVerification } from "../../helper/createPendingVerification.helper.js";
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";
import { createAuthenticatedAdmin } from "../../helper/createAuthenticatedAdmin.helper.js";
import app from "../../helper/createTestApp.helper.js";


describe("Rate limiter", () => {
    beforeEach(async () => {
        await redisClient.flushDb();
    });

    test("Should rate limit register route", async () => {
        for (let i = 0; i < env.REGISTER_RATE_LIMIT_MAX; i++) {
            await request(app)
                .post("/api/v1/auth/register")
                .send(createUserPayload());
        }

        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(createUserPayload());

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
    });

    test("Should rate limit login route", async () => {
        for (let i = 0; i < env.LOGIN_RATE_LIMIT_MAX; i++) {
            await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "unknown@gmail.com",
                    password: "WrongPassword",
                });
        }

        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "unknown@gmail.com",
                password: "WrongPassword",
            });

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
    });

    test("Should rate limit verify-email route", async () => {
        for (let i = 0; i < env.VERIFICATION_RATE_LIMIT_MAX; i++) {
            await request(app)
                .post("/api/v1/auth/verify-email")
                .send({
                    email: "test@gmail.com",
                    otp: "123456",
                });
        }

        const response = await request(app)
            .post("/api/v1/auth/verify-email")
            .send({
                email: "test@gmail.com",
                otp: "123456",
            });

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
    });

    test("Should rate limit resend verification route", async () => {
        const { user } = await createPendingVerification();

        await redisClient.del(
            `email-verification-cooldown:${user.email}`
        );

        for (let i = 0; i < env.RESEND_VERIFICATION_RATE_LIMIT_MAX; i++) {
            await request(app)
                .post("/api/v1/auth/resend-verification")
                .send({
                    email: user.email,
                });

            await redisClient.del(
                `email-verification-cooldown:${user.email}`
            );
        }

        const response = await request(app)
            .post("/api/v1/auth/resend-verification")
            .send({
                email: user.email,
            });

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
    });

    test("Should rate limit forgot password route", async () => {
        const { user } = await createAuthenticatedUser();

        await redisClient.del(
            `password-reset-cooldown:${user.email}`
        );

        for (let i = 0; i < env.FORGOT_PASSWORD_RATE_LIMIT_MAX; i++) {
            await request(app)
                .post("/api/v1/auth/forgot-password")
                .send({
                    email: user.email,
                });

            await redisClient.del(
                `password-reset-cooldown:${user.email}`
            );
        }

        const response = await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({
                email: user.email,
            });

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
    });

    test("Should rate limit admin register route", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();

        for (let i = 0; i < env.ADMIN_RATE_LIMIT_MAX; i++) {
            await agent
                .post("/api/v1/auth/admin/register")
                .set("Authorization", `Bearer ${accessToken}`)
                .send(createUserPayload());
        }

        const response = await agent
            .post("/api/v1/auth/admin/register")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(createUserPayload());

        expect(response.statusCode).toBe(429);
        expect(response.body.success).toBe(false);
    });

    test("Should return standard rate limit headers", async () => {
        for (let i = 0; i < env.LOGIN_RATE_LIMIT_MAX; i++) {
            await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "test@gmail.com",
                    password: "WrongPassword",
                });
        }

        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "test@gmail.com",
                password: "WrongPassword",
            });

        expect(response.statusCode).toBe(429);
        expect(response.headers["ratelimit-limit"]).toBeDefined();
        expect(response.headers["ratelimit-remaining"]).toBe("0");
        expect(response.headers["ratelimit-reset"]).toBeDefined();
    });
});