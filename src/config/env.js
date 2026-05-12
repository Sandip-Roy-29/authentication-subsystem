import dotenv from "dotenv"
import {z} from "zod"
import logger from "../utils/logger.js";

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`
})

const envSchema = z.object({
    NODE_ENV: z
        .enum([
            "development",
            "test",
            "production"
        ],{
            required_error: "NODE_ENV is required"
        }),

    PORT: z
        .coerce.number({
            invalid_type_error: "PORT must be a valid number"
        })
        .min(1, "PORT must be greater than 0")
        .max(65535, "PORT must be less than 65535"),

    MONGODB_URI: z
            .string({
                required_error: "MONGODB_URI is required"
            })
            .min(1, "MONGODB_URI can not be empty"),

    JWT_SECRET: z
            .string({
                required_error: "JWT_SECRET is required"
            })
            .min(1, "JWT_SECRET can not be empty"),

    DB_MIN_POOL_SIZE: z
            .coerce.number({
                invalid_type_error: "DB_MIN_POOL_SIZE must be a valid number"
            })
            .min(0, "DB_MIN_POOL_SIZE can not be negative"),

    DB_MAX_POOL_SIZE: z
            .coerce.number({
                invalid_type_error: "DB_MAX_POOL_SIZE must be a valid number"
            })
            .min(1, "DB_MAX_POOL_SIZE size can not be empty")
}).refine(
    data => data.DB_MIN_POOL_SIZE <= data.DB_MAX_POOL_SIZE,
    {
        message: "DB_MIN_POOL_SIZE cannot be greater than DB_MAX_POOL_SIZE",
        path:["DB_MIN_POOL_SIZE"]
    }
    )

const parsedEnv = envSchema.safeParse(process.env);

if(!parsedEnv.success){
    logger.fatal(
        {
            issues: parsedEnv.error.issues.map((issue) =>({
                field: issue.path.join("."),
                message: issue.message
            }))
        },
        "Invalid environment variables"
    )

    process.exit(1);
}

const env = Object.freeze(parsedEnv.data);

export default env;