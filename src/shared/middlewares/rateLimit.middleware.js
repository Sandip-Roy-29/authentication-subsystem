import rateLimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import redisClient from "#infra/redis/redis.client.js";
import RedisStore from "rate-limit-redis";
import { AppError, logger } from "../utils";

export const createRateLimiter = ({ prefix, ...options }) => {
    return rateLimit({
        ...options,
        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            client: redisClient,
        }),
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            return `${prefix}:${ipKeyGenerator(req.ip)}`;
        },
        handler: (req, res, next) => {
            logger.warn("Rate limit exceeded", {
                ip: req.ip,
                route: req.originalUrl,
                method: req.method,
                requestId: req.requestId,
            });

            next(
                new AppError(
                    "Too many requests. Please try again in 15 minutes.",
                    429
                )
            );
        },
    });
};
