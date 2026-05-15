import dotenv from "dotenv";
import { z } from "zod";
import logger from "../utils/logger.util.js";

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`,
});

const envSchema = z
    .object({
        NODE_ENV: z.enum(["development", "test", "production"], {
            required_error: "NODE_ENV is required",
        }),

        PORT: z.coerce
            .number({
                invalid_type_error: "PORT must be a valid number",
            })
            .min(1, "PORT must be greater than 0")
            .max(65535, "PORT must be less than 65535"),

        MONGODB_URI: z
            .string({
                required_error: "MONGODB_URI is required",
            })
            .min(1, "MONGODB_URI can not be empty"),

        JWT_SECRET: z
            .string({
                required_error: "JWT_SECRET is required",
            })
            .min(1, "JWT_SECRET can not be empty"),

        DB_MIN_POOL_SIZE: z.coerce
            .number({
                invalid_type_error: "DB_MIN_POOL_SIZE must be a valid number",
            })
            .min(0, "DB_MIN_POOL_SIZE can not be negative"),

        DB_MAX_POOL_SIZE: z.coerce
            .number({
                invalid_type_error: "DB_MAX_POOL_SIZE must be a valid number",
            })
            .min(1, "DB_MAX_POOL_SIZE size can not be empty"),

        BCRYPT_SALT_ROUNDS: z.coerce
            .number({
                invalid_type_error: "BCRYPT_SALT_ROUNDS must be a valid number",
            })
            .min(5, "BCRYPT_SALT_ROUNDS must be at least 5"),

        ACCESS_TOKEN_SECRET: z
            .string({
                required_error: "ACCESS_TOKEN_SECRET is required"
            })
            .min(32, "ACCESS_TOKEN_SECRET must be at least 32 character"),
        
        ACCESS_TOKEN_EXPIRY: z
            .string({
                required_error: "ACCESS_TOKEN_EXPIRY is required"
            })
            .min(1, "ACCESS_TOKEN_EXPIRY can not be empty"),

        REFRESH_TOKEN_SECRET: z
            .string({
                required_error: "REFRESH_TOKEN_SECRET is required"
            })
            .min(32, "REFRESH_TOKEN_SECRET must be at least 32 character"),

        REFRESH_TOKEN_EXPIRY: z
            .string({
                required_error: "REFRESH_TOKEN_EXPIRY is required"
            })
            .min(1, "REFRESH_TOKEN_EXPIRY can not be empty"),
    })
    .refine((data) => data.DB_MIN_POOL_SIZE <= data.DB_MAX_POOL_SIZE, {
        message: "DB_MIN_POOL_SIZE cannot be greater than DB_MAX_POOL_SIZE",
        path: ["DB_MIN_POOL_SIZE"],
    });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    logger.fatal(
        {
            issues: parsedEnv.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        },
        "Invalid environment variables"
    );

    process.exit(1);
}

const env = Object.freeze(parsedEnv.data);

export default env;
