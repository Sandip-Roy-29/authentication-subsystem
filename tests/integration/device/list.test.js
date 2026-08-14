// tests/integration/device/list.test.js
import request from "supertest";
import { describe, test, expect } from "@jest/globals";
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";
import { createTestDevice } from "../../helper/createTestDevice.helper.js";
import app from "../../helper/createTestApp.helper.js";

describe("List devices route", () => {
    test("returns only the authenticated user's devices", async () => {
        const { accessToken, user } = await createAuthenticatedUser();
        const { user: otherUser } = await createAuthenticatedUser();

        await createTestDevice({ owner: user.id, overrides: { name: "Mine" } });
        await createTestDevice({ owner: otherUser.id, overrides: { name: "Not mine" } });

        const res = await request(app)
            .get("/api/v1/devices")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].name).toBe("Mine");
    });

    test("excludes revoked devices", async () => {
        const { accessToken, user } = await createAuthenticatedUser();

        await createTestDevice({
            owner: user.id,
            overrides: { revoked: true },
        });

        const res = await request(app)
            .get("/api/v1/devices")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.body.data).toHaveLength(0);
    });

    test("never exposes apiKey in the response", async () => {
        const { accessToken, user } = await createAuthenticatedUser();
        await createTestDevice({ owner: user.id });

        const res = await request(app)
            .get("/api/v1/devices")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.body.data[0]).not.toHaveProperty("apiKey");
    });
});