import { z } from "zod";

export const authSchema = z.object({
    BCRYPT_SALT_ROUNDS: z.coerce
        .number({
            invalid_type_error: "BCRYPT_SALT_ROUNDS must be a valid number",
        })
        .int("BCRYPT_SALT_ROUNDS must be integer")
        .positive("BCRYPT_SALT_ROUNDS must be positive")
        .min(1, "BCRYPT_SALT_ROUNDS must be at least 1")
        .max(15, "BCRYPT_SALT_ROUNDS must be less than or equal to 15"),

    ACCESS_TOKEN_SECRET: z
        .string({
            required_error: "ACCESS_TOKEN_SECRET is required",
        })
        .min(32, "ACCESS_TOKEN_SECRET must be at least 32 character"),

    ACCESS_TOKEN_EXPIRY: z
        .string({
            required_error: "ACCESS_TOKEN_EXPIRY is required",
        })
        .min(1, "ACCESS_TOKEN_EXPIRY can not be empty")
        .regex(/^\d+[smhd]$/, "Use format like 15m, 1h, 7d"),

    REFRESH_TOKEN_SECRET: z
        .string({
            required_error: "REFRESH_TOKEN_SECRET is required",
        })
        .min(32, "REFRESH_TOKEN_SECRET must be at least 32 character"),

    REFRESH_TOKEN_EXPIRY: z
        .string({
            required_error: "REFRESH_TOKEN_EXPIRY is required",
        })
        .min(1, "REFRESH_TOKEN_EXPIRY can not be empty")
        .regex(/^\d+[smhd]$/, "Use format like 15m, 1h, 7d"),
});
