import dotenv from "dotenv";
import { appSchema } from "./app.schema.js";
import { databaseSchema } from "./database.schema.js";
import { emailSchema } from "./email.schema.js";
import { oauthSchema } from "./oauth.schema.js";
import { rateLimitSchema } from "./rateLimit.schema.js";
import { redisSchema } from "./redis.schema.js";
import { authSchema } from "./auth.schema.js";

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`,
});

const envSchema = appSchema
    .merge(authSchema)
    .merge(databaseSchema)
    .merge(emailSchema)
    .merge(oauthSchema)
    .merge(rateLimitSchema)
    .merge(redisSchema)
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
