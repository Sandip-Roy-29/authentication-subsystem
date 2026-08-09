import { createClient } from "redis";
import env from "#env";
import { logger } from "#shared/utils/index.js";

const redisClient = createClient({
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    },

    ...(env.REDIS_PASSWORD && {
        password: env.REDIS_PASSWORD,
    }),
});

redisClient.on("error", (err) => {
    logger.error({ err }, "Redis error");
});

export default redisClient;