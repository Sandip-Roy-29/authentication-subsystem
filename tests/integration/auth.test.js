import request from "supertest";
import app from "../../src/app.js";
import { describe, test, expect } from "@jest/globals";

const agent = request.agent(app);

describe("Auth Routes", () => {
    test("Should register a user", async () => {
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sandip Roy",
            email: "Sandip@gmail.com",
            password: "Sandip@123",
        });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.headers["set-cookie"][0]).toContain("accessToken");
    });

    test("Should reject register less than 3 character name", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sa",
            email: uniqueEmail,
            password: "Sandip@123",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject register with invalid name", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "12345",
            email: uniqueEmail,
            password: "Sandip@123",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject register with invalid email", async () => {
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sandip Roy",
            email: "uniqueEmail",
            password: "Sandip@123",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject register with invalid password", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sandip Roy",
            email: uniqueEmail,
            password: "testpassword",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject register without name", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "",
            email: uniqueEmail,
            password: "testpassword",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject register without email", async () => {
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sandip Roy",
            email: "",
            password: "testpassword",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject register without password", async () => {
        const uniqueEmail = `test${Date.now()}@gmail.com`;
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "Sandip Roy",
            email: uniqueEmail,
            password: "",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject register with duplicate email", async () => {
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

    test("Should login a user", async () => {
        const response1 = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                email: "Test@gmail.com",
                password: "Test@123",
            });

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app).post("/api/v1/auth/login").send({
            email: "Test@gmail.com",
            password: "Test@123",
        });

        expect(response2.statusCode).toBe(200);
        expect(response2.body.success).toBe(true);
        expect(response2.headers["set-cookie"][0]).toContain("accessToken");
    });

    test("Should reject login without email", async () => {
        const response1 = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                email: "Test@gmail.com",
                password: "Test@123",
            });

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app).post("/api/v1/auth/login").send({
            name: "Test",
            email: "",
            password: "Test@123",
        });

        expect(response2.statusCode).toBe(400);
        expect(response2.body.success).toBe(false);
    });

    test("Should reject login with invalid email", async () => {
        const response1 = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                email: "Test@gmail.com",
                password: "Test@123",
            });

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app).post("/api/v1/auth/login").send({
            name: "Test",
            email: "invalidemail",
            password: "Test@123",
        });

        expect(response2.statusCode).toBe(400);
        expect(response2.body.success).toBe(false);
    });

    test("Should reject login with a new email", async () => {
        const response1 = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                email: "Test1@gmail.com",
                password: "Test1@123",
            });

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app).post("/api/v1/auth/login").send({
            name: "Test",
            email: "Test2@gmail.com",
            password: "Test1@123",
        });

        expect(response2.statusCode).toBe(404);
        expect(response2.body.success).toBe(false);
    });

    test("Should reject login without password", async () => {
        const response1 = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                email: "Test1@gmail.com",
                password: "Test1@123",
            });

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app).post("/api/v1/auth/login").send({
            name: "Test",
            email: "Test1@gmail.com",
            password: "",
        });

        expect(response2.statusCode).toBe(400);
        expect(response2.body.success).toBe(false);
    });

    test("Should reject login with invalid password", async () => {
        const response1 = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                email: "Test1@gmail.com",
                password: "Test1@123",
            });

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app).post("/api/v1/auth/login").send({
            name: "Test",
            email: "Test1@gmail.com",
            password: "Test2@123",
        });

        expect(response2.statusCode).toBe(401);
        expect(response2.body.success).toBe(false);
    });

    test("Should access /me with valid token", async () => {
        const response1 = await agent.post("/api/v1/auth/register").send({
            name: "Test",
            email: "Test1@gmail.com",
            password: "Test1@123",
        });

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await agent.get("/api/v1/me");

        expect(response2.statusCode).toBe(200);
        expect(response2.body.success).toBe(true);
        expect(response2.body.data.email).toBe("test1@gmail.com");
    });

    test("Should logout a user", async () => {
        const response1 = await agent.post("/api/v1/auth/register").send({
            name: "Test",
            email: "Test1@gmail.com",
            password: "Test1@123",
        });

        expect(response1.statusCode).toBe(201);
        expect(response1.body.success).toBe(true);

        const response2 = await agent.post("/api/v1/auth/logout");

        expect(response2.statusCode).toBe(200);
        expect(response2.body.success).toBe(true);

        const response3 = await agent.get("/api/v1/me");

        expect(response3.statusCode).toBe(401);
        expect(response3.body.success).toBe(false);
    });

    test("Should reject /me without token", async () => {
        const response = await request(app).get("/api/v1/me");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject invalid token", async () => {
        const response = await request(app)
            .get("/api/v1/me")
            .set("Cookie", ["accessToken=invalidtoken"]);

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
