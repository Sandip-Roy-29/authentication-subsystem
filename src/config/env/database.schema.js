import { z } from "zod";

export const databaseSchema = z
    .object({
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
    })
    .refine((data) => data.DB_MIN_POOL_SIZE <= data.DB_MAX_POOL_SIZE, {
        message: "DB_MIN_POOL_SIZE cannot be greater than DB_MAX_POOL_SIZE",
        path: ["DB_MIN_POOL_SIZE"],
    });
