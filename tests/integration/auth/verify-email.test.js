import request from "supertest";
import { describe, test, expect } from "@jest/globals";

import redisClient from "#infra/redis/redis.client.js";
import { User } from "#modules/user/models/user.model.js";

import { requestRegistration } from "../../helper/requestRegistration.helper.js";
import { getEmailVerificationOtp } from "../../helper/getEmailVerificationOtp.helper.js";
import { verifyEmail } from "../../helper/verifyEmail.helper.js";
import app from "../../helper/createTestApp.helper.js";

describe("Verify email route", () => {
    test("Should verify email and create user", async () => {
        const { user, agent } = await requestRegistration();

        const otp = await getEmailVerificationOtp(user.email);

        const response = await verifyEmail(agent, user.email, otp);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);

        const createdUser = await User.findOne({
            email: user.email,
        });

        expect(createdUser).not.toBeNull();
        expect(createdUser.isEmailVerified).toBe(true);
        expect(createdUser.provider).toBe("local");

        expect(response.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("refreshToken")])
        );

        expect(response.body.data.accessToken).toBeDefined();

        expect(response.body.data.password).toBeUndefined();
        expect(response.body.data.refreshToken).toBeUndefined();
    });

    test("Should delete verification data from redis after successful verification", async () => {
        const { user, agent } = await requestRegistration();

        const otp = await getEmailVerificationOtp(user.email);

        await verifyEmail(agent, user.email, otp);

        expect(
            await redisClient.get(`email-verification:${user.email}`)
        ).toBeNull();

        expect(
            await redisClient.get(`email-verification-cooldown:${user.email}`)
        ).toBeNull();
    });

    test("Should reject without email", async () => {
        const response = await request(app)
            .post("/api/v1/auth/verify-email")
            .send({
                email: "",
                otp: "123456",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject without otp", async () => {
        const { user } = await requestRegistration();

        const response = await  request(app)
            .post("/api/v1/auth/verify-email")
            .send({
                email: user.email,
                otp: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject invalid otp", async () => {
        const { user } = await requestRegistration();

        const response = await  request(app)
            .post("/api/v1/auth/verify-email")
            .send({
                email: user.email,
                otp: "000000",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject expired verification", async () => {
        const { user } = await requestRegistration();

        await redisClient.del(`email-verification:${user.email}`);

        const response = await  request(app)
            .post("/api/v1/auth/verify-email")
            .send({
                email: user.email,
                otp: "123456",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject otp for another email", async () => {
        const first = await requestRegistration();
        const second = await requestRegistration();

        const otp = await getEmailVerificationOtp(first.user.email);

        const response = await request(app)
            .post("/api/v1/auth/verify-email")
            .send({
                email: second.user.email,
                otp,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject verifying same email twice", async () => {
        const { user } = await requestRegistration();

        const otp = await getEmailVerificationOtp(user.email);

        await  request(app)
            .post("/api/v1/auth/verify-email")
            .send({
                email: user.email,
                otp: otp,
            });

        const response = await  request(app)
            .post("/api/v1/auth/verify-email")
            .send({
                email: user.email,
                otp: otp,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
