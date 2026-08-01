import request from "supertest";
import { describe, test, expect } from "@jest/globals";

import redisClient from "#infra/redis/redis.client.js";
import { User } from "#modules/user/models/user.model.js";

import { createUser } from "../../helper/createUser.helper.js";
import { createPasswordReset } from "../../helper/createPasswordReset.helper.js";
import { loginUser } from "../../helper/loginUser.helper.js";
import app from "../../helper/createTestApp.helper.js";

describe("Reset password route", () => {
    test("Should reset password successfully", async () => {
        const { user, otp } = await createPasswordReset();

        const response = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({
                email: user.email,
                otp,
                password: "NewPassword@123",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test("Should reject without required fields", async () => {
        const response = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject expired password reset session", async () => {
        const { user, otp } = await createPasswordReset();

        await redisClient.del(`password-reset:${user.email}`);

        const response = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({
                email: user.email,
                otp,
                password: "NewPassword@123",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject invalid OTP", async () => {
        const { user } = await createPasswordReset();

        const response = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({
                email: user.email,
                otp: "000000",
                password: "NewPassword@123",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject when user no longer exists", async () => {
        const { user, otp } = await createPasswordReset();

        await User.findByIdAndDelete(user._id);

        const response = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({
                email: user.email,
                otp,
                password: "NewPassword@123",
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("Should update the user's password", async () => {
        const { user, otp } = await createPasswordReset();

        await request(app)
            .post("/api/v1/auth/reset-password")
            .send({
                email: user.email,
                otp,
                password: "NewPassword@123",
            });

        const login = await loginUser({
            email: user.email,
            password: "NewPassword@123",
        });

        expect(login.response.statusCode).toBe(200);
    });

    test("Should remove password reset session", async () => {
        const { user, otp } = await createPasswordReset();

        await request(app)
            .post("/api/v1/auth/reset-password")
            .send({
                email: user.email,
                otp,
                password: "NewPassword@123",
            });

        expect(
            await redisClient.get(`password-reset:${user.email}`)
        ).toBeNull();
    });

    test("Should remove password reset cooldown", async () => {
        const { user, otp } = await createPasswordReset();

        await request(app)
            .post("/api/v1/auth/reset-password")
            .send({
                email: user.email,
                otp,
                password: "NewPassword@123",
            });

        expect(
            await redisClient.get(
                `password-reset-cooldown:${user.email}`
            )
        ).toBeNull();
    });

    test("Should remove refresh token after password reset", async () => {
        const user = await createUser();

        await loginUser({
            email: user.email,
            password: "Test@123",
        });

        const pending = await createPasswordReset(user);

        await request(app)
            .post("/api/v1/auth/reset-password")
            .send({
                email: user.email,
                otp: pending.otp,
                password: "NewPassword@123",
            });

        const updated = await User.findById(user._id).select(
            "+refreshToken.token"
        );

        expect(updated.refreshToken).toEqual({});
    });
});