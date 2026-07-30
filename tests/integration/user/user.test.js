import request from "supertest";
import app from "../../../src/app.js";
import { describe, test, expect } from "@jest/globals";

import { User } from "#modules/user/models/user.model.js";

import { createAuthenticatedAdmin } from "../../helper/createAuthenticatedAdmin.helper.js";
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";

describe("User routes", () => {
    // ===========================
    // GET /users
    // ===========================

    test("Should allow admin to get all users", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();

        await createAuthenticatedUser();
        await createAuthenticatedUser();

        const response = await agent
            .get("/api/v1/users")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    test("Should reject normal user from getting users", async () => {
        const { agent, accessToken } = await createAuthenticatedUser();

        const response = await agent
            .get("/api/v1/users")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test("Should reject unauthenticated request to get users", async () => {
        const response = await request(app).get("/api/v1/users");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    // ===========================
    // DELETE /users/:userId
    // ===========================

    test("Should allow admin to delete user", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();
        const { userId } = await createAuthenticatedUser();

        const response = await agent
            .delete(`/api/v1/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        const deletedUser = await User.findById(userId);

        expect(deletedUser).toBeNull();
    });

    test("Should reject normal user from deleting user", async () => {
        const { agent, accessToken } = await createAuthenticatedUser();
        const { userId } = await createAuthenticatedUser();

        const response = await agent
            .delete(`/api/v1/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test("Should reject unauthenticated request to delete user", async () => {
        const { userId } = await createAuthenticatedUser();

        const response = await request(app).delete(
            `/api/v1/users/${userId}`
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject deleting non-existing user", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();

        const response = await agent
            .delete("/api/v1/users/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("Should reject admin deleting own account", async () => {
        const { agent, accessToken, userId } =
            await createAuthenticatedAdmin();

        const response = await agent
            .delete(`/api/v1/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // ===========================
    // PATCH /users/:userId/role
    // ===========================

    test("Should allow admin to update user role", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();
        const { userId } = await createAuthenticatedUser();

        const response = await agent
            .patch(`/api/v1/users/${userId}/role`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                role: "admin",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.role).toBe("admin");

        const user = await User.findById(userId);

        expect(user.role).toBe("admin");
    });

    test("Should reject normal user from updating role", async () => {
        const { agent, accessToken } = await createAuthenticatedUser();
        const { userId } = await createAuthenticatedUser();

        const response = await agent
            .patch(`/api/v1/users/${userId}/role`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                role: "admin",
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test("Should reject unauthenticated request to update role", async () => {
        const { userId } = await createAuthenticatedUser();

        const response = await request(app)
            .patch(`/api/v1/users/${userId}/role`)
            .send({
                role: "admin",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Should reject updating non-existing user", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();

        const response = await agent
            .patch("/api/v1/users/507f1f77bcf86cd799439011/role")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                role: "admin",
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("Should reject updating to same role", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();
        const { userId } = await createAuthenticatedUser();

        const response = await agent
            .patch(`/api/v1/users/${userId}/role`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                role: "user",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject admin updating own role", async () => {
        const { agent, accessToken, userId } =
            await createAuthenticatedAdmin();

        const response = await agent
            .patch(`/api/v1/users/${userId}/role`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                role: "user",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should reject invalid role", async () => {
        const { agent, accessToken } = await createAuthenticatedAdmin();
        const { userId } = await createAuthenticatedUser();

        const response = await agent
            .patch(`/api/v1/users/${userId}/role`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                role: "invalid-role",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });
});