import { createRateLimiter } from "#shared/middlewares/rateLimit.middleware.js";
import env from "#env";

export default function createRateLimiters(redisClient) {
    return {
        loginRateLimiter: createRateLimiter({
            client: redisClient,
            prefix: "login",
            windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
            max: env.LOGIN_RATE_LIMIT_MAX,
        }),

        registerRateLimiter: createRateLimiter({
            client: redisClient,
            prefix: "register",
            windowMs: env.REGISTER_RATE_LIMIT_WINDOW_MS,
            max: env.REGISTER_RATE_LIMIT_MAX,
        }),

        refreshTokenRateLimiter: createRateLimiter({
            client: redisClient,
            prefix: "refreshToken",
            windowMs: env.REFRESH_RATE_LIMIT_WINDOW_MS,
            max: env.REFRESH_RATE_LIMIT_MAX,
        }),

        adminRateLimiter: createRateLimiter({
            client: redisClient,
            prefix: "admin",
            windowMs: env.ADMIN_RATE_LIMIT_WINDOW_MS,
            max: env.ADMIN_RATE_LIMIT_MAX,
        }),

        verificationRateLimiter: createRateLimiter({
            client: redisClient,
            prefix: "verification",
            windowMs: env.VERIFICATION_RATE_LIMIT_WINDOW_MS,
            max: env.VERIFICATION_RATE_LIMIT_MAX,
        }),

        resendVerificationRateLimiter: createRateLimiter({
            client: redisClient,
            prefix: "resend-verification",
            windowMs: env.RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS,
            max: env.RESEND_VERIFICATION_RATE_LIMIT_MAX,
        }),

        forgotPasswordRateLimiter: createRateLimiter({
            client: redisClient,
            prefix: "forgot",
            windowMs: env.FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
            max: env.FORGOT_PASSWORD_RATE_LIMIT_MAX,
        }),

        resetPasswordRateLimiter: createRateLimiter({
            client: redisClient,
            prefix: "reset",
            windowMs: env.RESET_PASSWORD_RATE_LIMIT_WINDOW_MS,
            max: env.RESET_PASSWORD_RATE_LIMIT_MAX,
        }),

        googleRateLimiter: createRateLimiter({
            client: redisClient,
            prefix: "google",
            windowMs: env.GOOGLE_RATE_LIMIT_WINDOW_MS,
            max: env.GOOGLE_RATE_LIMIT_MAX,
        }),
    };
}