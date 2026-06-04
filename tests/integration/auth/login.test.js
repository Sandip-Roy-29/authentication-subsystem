// Configs
import request from "supertest";
import app from "../../../src/app.js";
import { describe, test, expect } from "@jest/globals";

// Helpers
import { createUserPayload } from "../../helper/createUserPayload.helper.js";
import { registerUser } from "../../helper/registerUser.helper.js";
import { loginUser } from "../../helper/loginUser.helper.js";

describe("Logout route", () => {
    test("Should login a user", async () => {
        const user = createUserPayload();
        const response1 = await registerUser(user);

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await loginUser(user);

        expect(response2.statusCode).toBe(200);
        expect(response2.body.success).toBe(true);
        expect(response2.headers["set-cookie"][0]).toContain("refreshToken");
    });

    test("Should reject without email", async () => {
        const response2 = await request(app).post("/api/v1/auth/login").send({
            email: "",
            password: "Test@123",
        });

        expect(response2.statusCode).toBe(400);
        expect(response2.body.success).toBe(false);
    });

    test("Should reject with invalid email", async () => {
        const response2 = await request(app).post("/api/v1/auth/login").send({
            email: "invalidemail",
            password: "Test@123",
        });

        expect(response2.statusCode).toBe(400);
        expect(response2.body.success).toBe(false);
    });

    test("Should reject with new email", async () => {
        const user = createUserPayload();
        const response1 = await registerUser(user);

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app).post("/api/v1/auth/login").send({
            email: "Test2@gmail.com",
            password: "Test1@123",
        });

        expect(response2.statusCode).toBe(404);
        expect(response2.body.success).toBe(false);
    });

    test("Should reject without password", async () => {
        const response2 = await request(app).post("/api/v1/auth/login").send({
            email: "Test1@gmail.com",
            password: "",
        });

        expect(response2.statusCode).toBe(400);
        expect(response2.body.success).toBe(false);
    });

    test("Should reject with invalid password", async () => {
        const user = createUserPayload();
        const response1 = await registerUser(user);

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app).post("/api/v1/auth/login").send({
            email: user.email,
            password: "Test2@123",
        });

        expect(response2.statusCode).toBe(401);
        expect(response2.body.success).toBe(false);
    });
});
