import express from "express";
import {
    registerController,
    loginController,
    logoutController,
    verificationEmailController,
    resendVerificationEmailController,
    forgotPasswordController,
    resetPasswordController,
    googleLoginController,
    refreshTokenController,
} from "../controllers/auth.controller.js";
import {
    loginSchema,
    registerSchema,
    registrationVerificationSchema,
    resetPasswordSchema,
    resendVerificationSchema,
    googleLoginSchema,
} from "../validators/auth.validation.js";
import {
    adminRateLimiter,
    forgotPasswordRateLimiter,
    googleRateLimiter,
    loginRateLimiter,
    refreshTokenRateLimiter,
    registerRateLimiter,
    resendVerificationRateLimiter,
    resetPasswordRateLimiter,
    verificationRateLimiter,
} from "../rateLimiter.js";
import { validateMiddleware } from "#shared/middlewares";
import {
    authorize,
    verifyRefreshToken,
    verifyAccessToken,
} from "../middlewares";

const router = express.Router();

router.post(
    "/register",
    (req, res, next) => {
        req.role = "user";
        next();
    },
    registerRateLimiter,
    validateMiddleware(registerSchema),
    registerController
);
router.post(
    "/admin/register",
    (req, res, next) => {
        req.role = "admin";
        next();
    },
    verifyAccessToken,
    authorize("admin"),
    adminRateLimiter,
    validateMiddleware(registerSchema),
    registerController
);
router.post(
    "/verify-email",
    verificationRateLimiter,
    validateMiddleware(registrationVerificationSchema),
    verificationEmailController
);
router.post(
    "/resend-verification",
    resendVerificationRateLimiter,
    validateMiddleware(resendVerificationSchema),
    resendVerificationEmailController
);
router.post(
    "/forgot-password",
    forgotPasswordRateLimiter,
    validateMiddleware(resendVerificationSchema),
    forgotPasswordController
);
router.post(
    "/reset-password",
    resetPasswordRateLimiter,
    validateMiddleware(resetPasswordSchema),
    resetPasswordController
);
router.post(
    "/login",
    loginRateLimiter,
    validateMiddleware(loginSchema),
    loginController
);
router.post(
    "/google",
    googleRateLimiter,
    validateMiddleware(googleLoginSchema),
    googleLoginController
);
router.post(
    "/refresh-token",
    verifyRefreshToken,
    refreshTokenRateLimiter,
    refreshTokenController
);
router.post("/logout", verifyAccessToken, logoutController);

export default router;
