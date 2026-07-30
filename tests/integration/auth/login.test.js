// Configs
import request from "supertest";
import app from "../../../src/app.js";
import { describe, test, expect } from "@jest/globals";

// Helpers
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";
import { loginUser } from "../../helper/loginUser.helper.js";
import { User } from "#modules/user/models/user.model.js";

describe("Login route", () => {
    test("Should login a verified user successfully", async () => {
        const { user } = await createAuthenticatedUser();

        const { response } = await loginUser({
            email: user.email,
            password: user.password,
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken: expect.any(String),
            })
        );
        expect(response.body.data.password).toBeUndefined();
        expect(response.body.data.refreshToken).toBeUndefined();
        expect(response.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("refreshToken")])
        );
    });

    test("Should reject without email", async () => {
        const response = await request(app).post("/api/v1/auth/login").send({
            email: "",
            password: "Test@123",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject with invalid email", async () => {
        const response = await request(app).post("/api/v1/auth/login").send({
            email: "invalidemail",
            password: "Test@123",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject with non-existing email", async () => {
        const response = await request(app).post("/api/v1/auth/login").send({
            email: "nouser@gmail.com",
            password: "Test@123",
        });

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("Should reject without password", async () => {
        const response = await request(app).post("/api/v1/auth/login").send({
            email: "Test1@gmail.com",
            password: "",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject with invalid password", async () => {
        const { user } = await createAuthenticatedUser();

        const response = await request(app).post("/api/v1/auth/login").send({
            email: user.email,
            password: "WrongPass@123",
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should issue a new refresh token on every login", async () => {
        const { user } = await createAuthenticatedUser();

        const first = await loginUser({
            email: user.email,
            password: user.password,
        });

        const second = await loginUser({
            email: user.email,
            password: user.password,
        });

        expect(first.response.statusCode).toBe(200);
        expect(second.response.statusCode).toBe(200);

        expect(first.cookies).toEqual(
            expect.arrayContaining([expect.stringContaining("refreshToken")])
        );

        expect(second.cookies).toEqual(
            expect.arrayContaining([expect.stringContaining("refreshToken")])
        );

        expect(first.cookies).not.toEqual(second.cookies);
    });

    test("Should reject unverified user", async () => {
        const password = "Test@123";
        const user = await User.create({
            name: "Test",
            email: "test@example.com",
            password,
            isEmailVerified: false,
        });

        const response = await request(app).post("/api/v1/auth/login").send({
            email: user.email,
            password,
        });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test("Should reject google account password login", async () => {
        const googleUser = await User.create({
            name: "Google User",
            email: "google@test.com",
            provider: "google",
            googleId: "google-123",
            isEmailVerified: true,
        });

        const response = await request(app).post("/api/v1/auth/login").send({
            email: googleUser.email,
            password: "Anything",
        });

        expect(response.statusCode).toBe(400);
    });
});
