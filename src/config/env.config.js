import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`,
});

const envSchema = z
    .object({
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
            .int("DB_MIN_POOL_SIZE must be integer")
            .default(0),

        DB_MAX_POOL_SIZE: z.coerce
            .number({
                invalid_type_error: "DB_MAX_POOL_SIZE must be a valid number",
            })
            .min(1, "DB_MAX_POOL_SIZE size can not be empty")
            .max(100, "DB_MAX_POOL_SIZE must be less than 100")
            .int("DB_MAX_POOL_SIZE must be integer")
            .default(10),

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

        REDIS_URL: z
            .string({
                required_error: "REDIS_URL is required",
            })
            .url("REDIS_URL must be a valid URL"),

        LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce
            .number({
                invalid_type_error:
                    "LOGIN_RATE_LIMIT_WINDOW_MS must be a valid number",
            })
            .positive("LOGIN_RATE_LIMIT_WINDOW_MS must be positive")
            .int("LOGIN_RATE_LIMIT_WINDOW_MS must be integer"),

        LOGIN_RATE_LIMIT_MAX: z.coerce
            .number({
                invalid_type_error:
                    "LOGIN_RATE_LIMIT_MAX must be a valid number",
            })
            .positive("LOGIN_RATE_LIMIT_MAX must be positive")
            .int("LOGIN_RATE_LIMIT_MAX must be integer"),

        REGISTER_RATE_LIMIT_WINDOW_MS: z.coerce
            .number({
                invalid_type_error:
                    "REGISTER_RATE_LIMIT_WINDOW_MS must be a valid number",
            })
            .positive("REGISTER_RATE_LIMIT_WINDOW_MS must be positive")
            .int("REGISTER_RATE_LIMIT_WINDOW_MS must be integer"),

        REGISTER_RATE_LIMIT_MAX: z.coerce
            .number({
                invalid_type_error:
                    "REGISTER_RATE_LIMIT_MAX must be a valid number",
            })
            .positive("REGISTER_RATE_LIMIT_MAX must be positive")
            .int("REGISTER_RATE_LIMIT_MAX must be integer"),

        REFRESH_RATE_LIMIT_WINDOW_MS: z.coerce
            .number({
                invalid_type_error:
                    "REFRESH_RATE_LIMIT_WINDOW_MS must be a valid number",
            })
            .positive("REFRESH_RATE_LIMIT_WINDOW_MS must be positive")
            .int("REFRESH_RATE_LIMIT_WINDOW_MS must be integer"),

        REFRESH_RATE_LIMIT_MAX: z.coerce
            .number({
                invalid_type_error:
                    "REFRESH_RATE_LIMIT_MAX must be a valid number",
            })
            .positive("REFRESH_RATE_LIMIT_MAX must be positive")
            .int("REFRESH_RATE_LIMIT_MAX must be integer"),
        ADMIN_RATE_LIMIT_WINDOW_MS: z.coerce
            .number({
                invalid_type_error:
                    "ADMIN_RATE_LIMIT_WINDOW_MS must be a valid number",
            })
            .positive("ADMIN_RATE_LIMIT_WINDOW_MS must be positive")
            .int("ADMIN_RATE_LIMIT_WINDOW_MS must be integer"),

        ADMIN_RATE_LIMIT_MAX: z.coerce
            .number({
                invalid_type_error:
                    "ADMIN_RATE_LIMIT_MAX must be a valid number",
            })
            .positive("ADMIN_RATE_LIMIT_MAX must be positive")
            .int("ADMIN_RATE_LIMIT_MAX must be integer"),
        VERIFICATION_RATE_LIMIT_WINDOW_MS: z.coerce
            .number({
                invalid_type_error:
                    "VERIFICATION_RATE_LIMIT_WINDOW_MS must be a valid number",
            })
            .positive("VERIFICATION_RATE_LIMIT_WINDOW_MS must be positive")
            .int("VERIFICATION_RATE_LIMIT_WINDOW_MS must be integer"),

        VERIFICATION_RATE_LIMIT_MAX: z.coerce
            .number({
                invalid_type_error:
                    "VERIFICATION_RATE_LIMIT_MAX must be a valid number",
            })
            .positive("VERIFICATION_RATE_LIMIT_MAX must be positive")
            .int("VERIFICATION_RATE_LIMIT_MAX must be integer"),
        RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS: z.coerce
            .number({
                invalid_type_error:
                    "RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS must be a valid number",
            })
            .positive("RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS must be positive")
            .int("RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS must be integer"),

        RESEND_VERIFICATION_RATE_LIMIT_MAX: z.coerce
            .number({
                invalid_type_error:
                    "RESEND_VERIFICATION_RATE_LIMIT_MAX must be a valid number",
            })
            .positive("RESEND_VERIFICATION_RATE_LIMIT_MAX must be positive")
            .int("RESEND_VERIFICATION_RATE_LIMIT_MAX must be integer"),

        SMTP_HOST: z.coerce
            .string({
                required_error: "SMTP_HOST is required",
            }),

        SMTP_PORT: z.coerce
            .number({
                invalid_type_error: "PORT must be a valid number",
            })
            .min(1, "PORT must be greater than 0")
            .max(65535, "PORT must be less than 65535")
            .int("PORT must be integer")
            .default(587),

        SMTP_EMAIL: z.coerce
            .string({
                required_error: "SMTP_EMAIL is required",
            })
            .email("Invalid SMTP_EMAIL"),

        SMTP_PASSWORD: z
            .string({
                required_error: "SMTP_PASSWORD is required",
            })
            .min(1,"SMTP_PASSWORD cannot be empty")
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
