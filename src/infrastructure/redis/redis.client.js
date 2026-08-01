import { createClient } from "redis";
import env from "#env";
import { logger } from "#shared/utils/index.js";

const redisClient = createClient({
    url: env.REDIS_URL,
});

redisClient.on("error", (err) => {
    logger.error({ err }, "Redis error");
});

if (process.env.NODE_ENV === "test") {
    redisClient.connect().catch((err) => {
        logger.warn(
            { err },
            "Redis connection warning during test initialization"
        );
    });
}

export default redisClient;