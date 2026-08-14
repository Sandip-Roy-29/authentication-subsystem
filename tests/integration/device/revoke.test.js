// tests/integration/device/revoke.test.js
import request from "supertest";
import { describe, it, expect } from "@jest/globals";
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";
import { createTestDevice } from "../../helper/createTestDevice.helper.js";
import Device from "#modules/device/models/device.model.js";
import app from "../../helper/createTestApp.helper.js";

describe("Revoke route", () => {
    it("revokes a device the user owns", async () => {
        const { accessToken, user } = await createAuthenticatedUser();
        const device = await createTestDevice({ owner: user.id });

        const res = await request(app)
            .delete(`/api/v1/devices/${device.deviceId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);

        const updated = await Device.findOne({ deviceId: device.deviceId });
        expect(updated.revoked).toBe(true);
    });

    it("returns 404 for another user's device", async () => {
        const { accessToken } = await createAuthenticatedUser();
        const { user: otherUser } = await createAuthenticatedUser();
        const device = await createTestDevice({ owner: otherUser.id });

        const res = await request(app)
            .delete(`/api/v1/devices/${device.deviceId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(404);
    });

    it("returns 404 when revoking an already-revoked device", async () => {
        const { accessToken, user } = await createAuthenticatedUser();
        const device = await createTestDevice({
            owner: user.id,
            overrides: { revoked: true },
        });

        const res = await request(app)
            .delete(`/api/v1/devices/${device.deviceId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(404);
    });
});