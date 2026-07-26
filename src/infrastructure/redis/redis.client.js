import { createClient } from "redis";
import env from "#env";
import { logger } from "#shared/utils";

const redisClient = createClient({
    url: env.REDIS_URL,
});

redisClient.on("error", (err) => {
    logger.error("Redis error: ", err);
});

if (process.env.NODE_ENV === "test") {
    redisClient.connect().catch((err) => {
        logger.warn(
            "Redis connection warning during initialization (this is ok, it will reconnect):",
            err.message
        );
    });
} else {
    redisClient.connect().catch((err) => {
        logger.error("Failed to connect Redis client:", err);
    });
}

export default redisClient;
