import request from "supertest";
import { describe, test, expect } from "@jest/globals";
import { createAuthenticatedUser } from "../../helper/createAuthenticatedUser.helper.js";
import Device from "#modules/device/models/device.model.js";
import app from "../../helper/createTestApp.helper.js";

describe("Device register route", () => {
    test("registers a device and returns a one-time apiKey", async () => {
        const { accessToken } = await createAuthenticatedUser();

        const res = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "My Laptop", platform: "linux-daemon" });

        expect(res.statusCode).toBe(201);
        expect(res.body.data).toHaveProperty("deviceId");
        expect(res.body.data).toHaveProperty("apiKey");
        expect(res.body.data.role).toBe("controller");
        expect(res.body.data.capabilities).toEqual(
            expect.arrayContaining(["screenshot", "lock_screen"])
        );
    });

    test("assigns endpoint role for sensor platforms", async () => {
        const { accessToken } = await createAuthenticatedUser();

        const res = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Soil Sensor", platform: "esp32-sensor" });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.role).toBe("endpoint");
    });

    test("rejects an invalid platform", async () => {
        const { accessToken } = await createAuthenticatedUser();

        const res = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Unknown Device", platform: "toaster" });

        expect(res.statusCode).toBe(400);
    });

    test("rejects registration without authentication", async () => {
        const res = await request(app)
            .post("/api/v1/devices")
            .send({ name: "My Laptop", platform: "linux-daemon" });

        expect(res.statusCode).toBe(401);
    });

    test("stores only a hashed apiKey, never the raw value", async () => {
        const { accessToken } = await createAuthenticatedUser();

        const res = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "My Laptop", platform: "linux-daemon" });

        const stored = await Device.findOne({
            deviceId: res.body.data.deviceId,
        }).select("+apiKey");

        expect(stored.apiKey).not.toBe(res.body.data.apiKey);
    });
});