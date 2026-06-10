// Configs
import request from "supertest";
import app from "../../../src/app.js";
import { describe, test, expect } from "@jest/globals";

// Helpers
import { createAuthenticatedUser } from "../../helper/authenticatedUser.helper.js";

describe("Get users", () => {
    test("admin should get all users", async () => {
        const admin = await createAuthenticatedUser("admin");

        const { user } = await createAuthenticatedUser();

        const response = await admin.agent
            .get("/api/v1/users")
            .set("Authorization", `Bearer ${admin.accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);

        const firstUser = response.body.data[0];

        expect(firstUser.password).toBeUndefined();
        expect(firstUser.refreshToken).toBeUndefined();

        const emails = response.body.data.map((user) => user.email);

        expect(emails).toContain(admin.user.email);
        expect(emails).toContain(user.email);
    });
    test("user should not get all users", async () => {
        const { agent, accessToken } = await createAuthenticatedUser();

        await createAuthenticatedUser();

        const response = await agent
            .get("/api/v1/users")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Forbidden");
    });
    test("unauthenticated user should not get users", async () => {
        const response = await request(app).get("/api/v1/users");

        expect(response.statusCode).toBe(401);
    });
});

describe("Delete user", () => {
    test("admin should delete a user", async () => {
        const { agent: adminAgent, accessToken } =
            await createAuthenticatedUser("admin");

        const { userId } = await createAuthenticatedUser();

        const response = await adminAgent
            .delete(`/api/v1/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });
    test("user should not delete a user", async () => {
        const { agent: userAgent, accessToken } =
            await createAuthenticatedUser();

        const { user } = await createAuthenticatedUser();

        const response = await userAgent
            .delete(`/api/v1/users/${user._id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Forbidden");
    });
    test("should return 404 when deleting non-existing user", async () => {
        const { agent: adminAgent, accessToken } =
            await createAuthenticatedUser("admin");

        const userId = "507f1f77bcf86cd799439011";

        const response = await adminAgent
            .delete(`/api/v1/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User not found");
    });
    test("unauthenticated user should not delete user", async () => {
        const { user } = await createAuthenticatedUser();

        const response = await request(app).delete(`/api/v1/users/${user._id}`);

        expect(response.statusCode).toBe(401);
    });
});
