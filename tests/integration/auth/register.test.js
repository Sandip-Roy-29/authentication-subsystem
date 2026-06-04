// Configs
import request from "supertest";
import app from "../../../src/app.js";
import { describe, test, expect } from "@jest/globals";

// Helpers
import { createUserPayload } from "../../helper/createUserPayload.helper.js";
import { registerUser } from "../../helper/registerUser.helper.js";

describe("Register route", () => {
    test("Should register a user", async () => {
        const user = createUserPayload();

        const response = await registerUser(user);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.headers["set-cookie"][0]).toContain("refreshToken");
    });

    test("Should reject less than 3 character name", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sa",
            email: uniqueEmail,
            password: "Sandip@123",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject with invalid name", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "12345",
            email: uniqueEmail,
            password: "Sandip@123",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject with invalid email", async () => {
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sandip Roy",
            email: "uniqueEmail",
            password: "Sandip@123",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject with invalid password", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sandip Roy",
            email: uniqueEmail,
            password: "testpassword",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject without name", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "",
            email: uniqueEmail,
            password: "testpassword",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject without email", async () => {
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sandip Roy",
            email: "",
            password: "testpassword",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject without password", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sandip Roy",
            email: uniqueEmail,
            password: "",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject duplicate email", async () => {
        const response1 = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                email: "test@gmail.com",
                password: "Test@123",
            });

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                email: "test@gmail.com",
                password: "Test@123",
            });

        expect(response2.statusCode).toBe(409);
        expect(response2.body.success).toBe(false);
    });
});
