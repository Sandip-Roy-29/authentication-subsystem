import request from "supertest";
import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { User } from "#modules/user/models/user.model.js";
import googleClient from "#infra/passport/google.client.js";
import app from "../../helper/createTestApp.helper";

describe("Google login route", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test("Should create a new Google user", async () => {
        jest.spyOn(googleClient, "verifyIdToken").mockResolvedValue({
            getPayload: () => ({
                sub: "google-user-1",
                email: "google@test.com",
                name: "Google User",
                email_verified: true,
            }),
        });

        const response = await request(app).post("/api/v1/auth/google").send({
            idToken: "valid-google-token",
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        const user = await User.findOne({
            email: "google@test.com",
        });

        expect(user).not.toBeNull();
        expect(user.provider).toBe("google");
        expect(user.googleId).toBe("google-user-1");
        expect(user.isEmailVerified).toBe(true);
    });

    test("Should login an existing Google user", async () => {
        await User.create({
            name: "Google User",
            email: "google@test.com",
            provider: "google",
            googleId: "google-user-1",
            role: "user",
            isEmailVerified: true,
        });

        jest.spyOn(googleClient, "verifyIdToken").mockResolvedValue({
            getPayload: () => ({
                sub: "google-user-1",
                email: "google@test.com",
                name: "Google User",
                email_verified: true,
            }),
        });

        const response = await request(app).post("/api/v1/auth/google").send({
            idToken: "valid-google-token",
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        expect(await User.countDocuments()).toBe(1);
    });

    test("Should link an existing local account", async () => {
        await User.create({
            name: "Local User",
            email: "google@test.com",
            password: "Password@123",
            provider: "local",
            role: "user",
            isEmailVerified: true,
        });

        jest.spyOn(googleClient, "verifyIdToken").mockResolvedValue({
            getPayload: () => ({
                sub: "google-user-1",
                email: "google@test.com",
                name: "Local User",
                email_verified: true,
            }),
        });

        await request(app).post("/api/v1/auth/google").send({
            idToken: "valid-google-token",
        });

        const user = await User.findOne({
            email: "google@test.com",
        });

        expect(user.provider).toBe("google");
        expect(user.googleId).toBe("google-user-1");
    });

    test("Should reject an unverified Google email", async () => {
        jest.spyOn(googleClient, "verifyIdToken").mockResolvedValue({
            getPayload: () => ({
                sub: "google-user-1",
                email: "google@test.com",
                name: "Google User",
                email_verified: false,
            }),
        });

        const response = await request(app).post("/api/v1/auth/google").send({
            idToken: "valid-google-token",
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject Google account mismatch", async () => {
        await User.create({
            name: "Google User",
            email: "google@test.com",
            provider: "google",
            googleId: "old-google-id",
            role: "user",
            isEmailVerified: true,
        });

        jest.spyOn(googleClient, "verifyIdToken").mockResolvedValue({
            getPayload: () => ({
                sub: "new-google-id",
                email: "google@test.com",
                name: "Google User",
                email_verified: true,
            }),
        });

        const response = await request(app).post("/api/v1/auth/google").send({
            idToken: "valid-google-token",
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject missing idToken", async () => {
        const response = await request(app)
            .post("/api/v1/auth/google")
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should return an access token", async () => {
        jest.spyOn(googleClient, "verifyIdToken").mockResolvedValue({
            getPayload: () => ({
                sub: "google-user-1",
                email: "google@test.com",
                name: "Google User",
                email_verified: true,
            }),
        });

        const response = await request(app).post("/api/v1/auth/google").send({
            idToken: "valid-google-token",
        });

        expect(response.body.data.accessToken).toBeDefined();
    });

    test("Should set refresh token cookie", async () => {
        jest.spyOn(googleClient, "verifyIdToken").mockResolvedValue({
            getPayload: () => ({
                sub: "google-user-1",
                email: "google@test.com",
                name: "Google User",
                email_verified: true,
            }),
        });

        const response = await request(app).post("/api/v1/auth/google").send({
            idToken: "valid-google-token",
        });

        expect(response.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("refreshToken=")])
        );
    });

    test("Should reject an invalid Google token", async () => {
        jest.spyOn(googleClient, "verifyIdToken").mockRejectedValue(
            new Error("Invalid token")
        );

        const response = await request(app).post("/api/v1/auth/google").send({
            idToken: "invalid-token",
        });

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
    });
});
