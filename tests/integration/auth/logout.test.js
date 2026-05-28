// logout.test.js

import request from "supertest";
import app from "../../../src/app.js";
import { describe, test, expect } from "@jest/globals";
import { createAuthenticatedUser } from "../../helper/authenticatedUser.helper.js";

describe("Logout route", () => {
    test("Should logout a user", async () => {
        const { accessToken, agent } = await createAuthenticatedUser();

        const response = await agent
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.headers["set-cookie"][0])
            .toContain("refreshToken=");
    });

    test("Should reject invalid access token", async () => {
        const response = await request(app)
            .post("/api/v1/auth/logout")
            .set("Authorization", "Bearer InvalidToken");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject without access token", async () => {
        const response = await request(app)
            .post("/api/v1/auth/logout");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject malformed authorization header", async () => {
        const response = await request(app)
            .post("/api/v1/auth/logout")
            .set("Authorization", "InvalidFormat");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });
});