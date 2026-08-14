import express from "express";

import { validateMiddleware } from "#shared/middlewares/index.js";

import {
    verifyAccessToken,
} from "#modules/auth/middlewares/index.js";
import { deviceRegisterSchema, revokeDeviceSchema } from "../validators/device.validation.js";
import { listDevicesController, registerDeviceController, revokeDeviceController } from "../controllers/device.controller.js";

export default function createDeviceRouter(rateLimiters) {
    const {
        deviceRegisterRateLimiter,
        deviceListsRateLimiter,
        deviceRevokeRateLimiter,
    } = rateLimiters;

    const router = express.Router();

    router.post(
        "/",
        verifyAccessToken,
        deviceRegisterRateLimiter,
        validateMiddleware(deviceRegisterSchema),
        registerDeviceController
    );

    router.get(
        "/",
        verifyAccessToken,
        deviceListsRateLimiter,
        listDevicesController
    );

    router.delete(
        "/:deviceId",
        verifyAccessToken,
        deviceRevokeRateLimiter,
        validateMiddleware(revokeDeviceSchema),
        revokeDeviceController
    );

    return router;
}