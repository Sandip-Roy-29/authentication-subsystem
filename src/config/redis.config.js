import { createClient } from "redis";
import env from "./env.config.js";
import logger from "../utils/logger.util.js";

const redisClient = createClient({
    url: env.REDIS_URL
});

redisClient.on("error", (err) => {
    logger.error("Redis error: ", err);
});

export default redisClient;