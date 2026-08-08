import redisClient from "#infra/redis/redis.client.js";
import { logger } from "#shared/utils/index.js";

export default async function bootstrapRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        logger.info("Redis bootstrap completed");
    } catch (error) {
        logger.fatal({ err: error }, "Redis bootstrap failed");

        throw error;
    }
}