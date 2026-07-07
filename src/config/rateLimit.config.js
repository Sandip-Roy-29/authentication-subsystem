import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";
import env from "./env.config.js";

export const loginRateLimiter = createRateLimiter({
    prefix: "login",
    windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
    max: env.LOGIN_RATE_LIMIT_MAX,
});

export const registerRateLimiter = createRateLimiter({
    prefix: "register",
    windowMs: env.REGISTER_RATE_LIMIT_WINDOW_MS,
    max: env.REGISTER_RATE_LIMIT_MAX,
});

export const refreshTokenRateLimiter = createRateLimiter({
    prefix: "refreshToken",
    windowMs: env.REFRESH_RATE_LIMIT_WINDOW_MS,
    max: env.REFRESH_RATE_LIMIT_MAX,
});

export const adminRateLimiter = createRateLimiter({
    prefix: "admin",
    windowMs: env.ADMIN_RATE_LIMIT_WINDOW_MS,
    max: env.ADMIN_RATE_LIMIT_MAX,
});

export const verificationRateLimiter = createRateLimiter({
    prefix: "verification",
    windowMs: env.REFRESH_RATE_LIMIT_WINDOW_MS,
    max: env.REFRESH_RATE_LIMIT_MAX,
});

export const resendVerificationRateLimiter = createRateLimiter({
    prefix: "verification",
    windowMs: env.REFRESH_RATE_LIMIT_WINDOW_MS,
    max: env.REFRESH_RATE_LIMIT_MAX,
});
