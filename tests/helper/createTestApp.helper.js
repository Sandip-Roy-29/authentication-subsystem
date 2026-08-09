import createApplication from "#composition";
import redisClient from "#infra/redis/redis.client.js";

if (!redisClient.isOpen) {
    await redisClient.connect();
}

const app = createApplication();

export default app;