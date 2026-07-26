import { z } from "zod";

export const redisSchema = z.object({
    REDIS_URL: z
        .string({
            required_error: "REDIS_URL is required",
        })
        .url("REDIS_URL must be a valid URL"),
});
