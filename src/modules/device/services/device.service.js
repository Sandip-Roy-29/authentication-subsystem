import { AppError, logger } from "#shared/utils/index.js";
import {
    CAPABILITY_PRESETS,
    ENDPOINT_PLATFORMS,
} from "../constants/capabilityPresets.constant.js";
import crypto from "crypto";
import Device from "../models/device.model.js";

export const registerDevice = async ({ name, platform, userId }) => {
    if (!CAPABILITY_PRESETS[platform]) {
        throw new AppError("Invalid platform", 400);
    }

    const role = ENDPOINT_PLATFORMS.has(platform) ? "endpoint" : "controller";

    const apiKey = crypto.randomBytes(32).toString("hex");

    const device = await Device.create({
        owner: userId,
        name,
        platform,
        role,
        capabilities: CAPABILITY_PRESETS[platform],
        apiKey,
    });

    logger.info(
        { deviceId: device.deviceId, owner: userId },
        "Device registered"
    );

    const data = {
        deviceId: device.deviceId,
        name: device.name,
        platform: device.platform,
        role: device.role,
        capabilities: device.capabilities,
        apiKey,
    };

    return data;
};

export const listDevices = async ({ userId }) => {
    const devices = await Device.find({
        owner: userId,
        revoked: false,
    }).sort({ createdAt: -1 });

    return devices;
};

export const revokeDevice = async ({ userId, deviceId }) => {
    const device = await Device.findOneAndUpdate(
        { deviceId, owner: userId, revoked: false },
        { revoked: true },
        { returnDocument: "after" }
    );

    if (!device) {
        throw new AppError("Device not found", 404);
    }

    logger.info({ deviceId, owner: userId }, "Device revoked");
};
