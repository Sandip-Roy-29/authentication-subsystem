import { createRateLimiter } from "#shared/middlewares/rateLimit.middleware.js";
import env from "#env";

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
    windowMs: env.VERIFICATION_RATE_LIMIT_WINDOW_MS,
    max: env.VERIFICATION_RATE_LIMIT_MAX,
});

export const resendVerificationRateLimiter = createRateLimiter({
    prefix: "resend-verification",
    windowMs: env.RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS,
    max: env.RESEND_VERIFICATION_RATE_LIMIT_MAX,
});

export const forgotPasswordRateLimiter = createRateLimiter({
    prefix: "forgot",
    windowMs: env.FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
    max: env.FORGOT_PASSWORD_RATE_LIMIT_MAX,
});

export const resetPasswordRateLimiter = createRateLimiter({
    prefix: "reset",
    windowMs: env.RESET_PASSWORD_RATE_LIMIT_WINDOW_MS,
    max: env.RESET_PASSWORD_RATE_LIMIT_MAX,
});

export const googleRateLimiter = createRateLimiter({
    prefix: "google",
    windowMs: env.GOOGLE_RATE_LIMIT_WINDOW_MS,
    max: env.GOOGLE_RATE_LIMIT_MAX,
});
