import express from "express";
import {
    userRegisterController,
    adminRegisterController,
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
    validateMiddleware(registerSchema),
    registerRateLimiter,
    userRegisterController
);
router.post(
    "/admin/register",
    (req, res, next) => {
        req.role = "admin";
        next();
    },
    verifyAccessToken,
    authorize("admin"),
    validateMiddleware(registerSchema),
    adminRateLimiter,
    adminRegisterController
);
router.post(
    "/verify-email",
    validateMiddleware(registrationVerificationSchema),
    verificationRateLimiter,
    verificationEmailController
);
router.post(
    "/resend-verification",
    validateMiddleware(resendVerificationSchema),
    resendVerificationRateLimiter,
    resendVerificationEmailController
);
router.post(
    "/forgot-password",
    validateMiddleware(resendVerificationSchema),
    forgotPasswordRateLimiter,
    forgotPasswordController
);
router.post(
    "/reset-password",
    validateMiddleware(resetPasswordSchema),
    resetPasswordRateLimiter,
    resetPasswordController
);
router.post(
    "/login",
    validateMiddleware(loginSchema),
    loginRateLimiter,
    loginController
);
router.post(
    "/google",
    validateMiddleware(googleLoginSchema),
    googleRateLimiter,
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
