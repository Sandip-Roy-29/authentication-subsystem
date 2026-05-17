import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`,
});

const envSchema = z
    .object({
        NODE_ENV: z.enum(["development", "test", "production"], {
            required_error: "NODE_ENV is required",
        })
        .default("development"),

        PORT: z.coerce
            .number({
                invalid_type_error: "PORT must be a valid number",
            })
            .min(1, "PORT must be greater than 0")
            .max(65535, "PORT must be less than 65535")
            .default(3000),

        MONGODB_URI: z
            .string({
                required_error: "MONGODB_URI is required",
            })
            .min(1, "MONGODB_URI can not be empty"),

        DB_MIN_POOL_SIZE: z.coerce
            .number({
                invalid_type_error: "DB_MIN_POOL_SIZE must be a valid number",
            })
            .min(0, "DB_MIN_POOL_SIZE can not be negative")
            .max(50, "DB_MIN_POOL_SIZE must be less than 50")
            .default(0),

        DB_MAX_POOL_SIZE: z.coerce
            .number({
                invalid_type_error: "DB_MAX_POOL_SIZE must be a valid number",
            })
            .min(1, "DB_MAX_POOL_SIZE size can not be empty")
            .max(100, "DB_MAX_POOL_SIZE must be less than 100")
            .default(10),

        BCRYPT_SALT_ROUNDS: z.coerce
            .number({
                invalid_type_error: "BCRYPT_SALT_ROUNDS must be a valid number",
            })
            .min(1, "BCRYPT_SALT_ROUNDS must be at least 1"),

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
    })
    .refine((data) => data.DB_MIN_POOL_SIZE <= data.DB_MAX_POOL_SIZE, {
        message: "DB_MIN_POOL_SIZE cannot be greater than DB_MAX_POOL_SIZE",
        path: ["DB_MIN_POOL_SIZE"],
    });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment variables:");
    parsedEnv.error.issues.forEach((issue) => {
        console.error(`- ${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
}

const env = Object.freeze(parsedEnv.data);

export default env;
