import { z } from "zod";

export const appSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"], {
            required_error: "NODE_ENV is required",
        })
        .default("development"),

    PORT: z.coerce
        .number({
            invalid_type_error: "PORT must be a valid number",
        })
        .min(1, "PORT must be greater than 0")
        .max(65535, "PORT must be less than 65535")
        .int("PORT must be integer")
        .default(3000),

    FRONTEND_URL: z
        .string({
            required_error: "FRONTEND_URL is required",
        })
        .url("FRONTEND_URL must be a valid URL"),
});
