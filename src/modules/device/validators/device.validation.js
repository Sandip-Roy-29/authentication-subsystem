import { z } from "zod";
import { CAPABILITY_PRESETS } from "../constants/capabilityPresets.constant.js";

const platformValues = Object.keys(CAPABILITY_PRESETS);


export const deviceRegisterSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, "Device name is required")
            .max(100, "Device name must be under 100 characters"),
        platform: z.enum(platformValues, {
            errorMap: () => ({ message: "Invalid platform" }),
        }),
    }),
});

export const revokeDeviceSchema = z.object({
    params: z.object({
        deviceId: z.string().uuid("Invalid device ID"),
    }),
});
