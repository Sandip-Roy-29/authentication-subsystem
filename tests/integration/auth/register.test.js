// Configs
import request from "supertest";
import { describe, test, expect, beforeEach } from "@jest/globals";

// Helpers
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";
import { createUserPayload } from "../../helper/createUserPayload.helper.js";
import { User } from "#modules/user/models/user.model.js";
import { sendMailMock } from "../../mocks/transporter.mock.js";
import app from "../../helper/createTestApp.helper.js";


describe("Register route", () => {
    beforeEach(() => {
        sendMailMock.mockClear();
    });
    test("Should send verification email successfully", async () => {
        const user = createUserPayload();
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(user);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Verification email sent successfully"
        );

        const createdUser = await User.findOne({
            email: user.email,
        });

        expect(createdUser).toBeNull();

        expect(sendMailMock).toHaveBeenCalledTimes(1);

        expect(sendMailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: user.email,
                subject: "Verify your email",
                html: expect.stringContaining("<h2>"),
            })
        );
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
        const user = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                email: user.user.email,
                password: "Test@123",
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.success).toBe(false);
    });
});
