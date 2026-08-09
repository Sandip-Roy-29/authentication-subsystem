import { z } from "zod";

export const redisSchema = z.object({
    REDIS_HOST: z
        .string({
            required_error: "REDIS_HOST is required",
        }),
    REDIS_PORT: z.coerce
        .number({
            required_error: "REDIS_PORT is required",
        })
        .default(6379),
    REDIS_PASSWORD: z
        .string({
            required_error: "REDIS_PASSWORD is required",
        })
        .optional()
});
