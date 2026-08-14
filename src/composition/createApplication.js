import createApp from "../app.js";

import createRateLimiters from "#shared/security/rateLimiter.js";

import createAuthRouter from "#modules/auth/routes/auth.route.js";
import createUserRouter from "#modules/user/routes/user.route.js";
import createDeviceRouter from "#modules/device/routes/device.route.js";

import redisClient from "#infra/redis/redis.client.js";

export default function createApplication() {
    const rateLimiters = createRateLimiters(redisClient);

    const authRouter = createAuthRouter(rateLimiters);

    const userRouter = createUserRouter(rateLimiters);

    const deviceRouter = createDeviceRouter(rateLimiters);

    return createApp({
        authRouter,
        userRouter,
        deviceRouter,
    });
}