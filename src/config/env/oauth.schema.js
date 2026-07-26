import { z } from "zod";

export const oauthSchema = z.object({
    GOOGLE_CLIENT_ID: z
        .string({
            required_error: "GOOGLE_CLIENT_ID is required",
        })
        .min(1, "GOOGLE_CLIENT_ID cannot be empty"),

    GOOGLE_CLIENT_SECRET: z
        .string({
            required_error: "GOOGLE_CLIENT_SECRET is required",
        })
        .min(1, "GOOGLE_CLIENT_SECRET cannot be empty"),

    GOOGLE_CALLBACK_URL: z
        .string({
            required_error: "GOOGLE_CALLBACK_URL is required",
        })
        .url("GOOGLE_CALLBACK_URL must be a valid URL"),
});
