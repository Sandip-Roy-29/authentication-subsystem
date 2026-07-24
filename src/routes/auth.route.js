// Packages
import express from "express";

// Controller
import { userRegisterController, adminRegisterController, loginController,logoutController, verificationEmailController, resendVerificationEmailController, forgotPasswordController, resetPasswordController } from "../controllers/auth.controller.js";

// Validation
import { registerSchema, registrationVerificationSchema, resetPasswordSchema, resendVerificationSchema } from "../validations/auth.validation.js";
import { loginSchema } from "../validations/auth.validation.js";
import verifyAccessToken from "../middlewares/verifyAccessToken.middleware.js";

// Configs
import {
    adminRateLimiter,
    forgotPasswordRateLimiter,
    loginRateLimiter,
    registerRateLimiter,
    resendVerificationRateLimiter,
    resetPasswordRateLimiter,
    verificationRateLimiter,
} from "../config/rateLimit.config.js";

// Middlewares
import validateMiddleware from "../middlewares/validate.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";

const router = express.Router();

router.post(
    "/register",
    validateMiddleware(registerSchema),
    registerRateLimiter,
    userRegisterController
);
router.post(
    "/admin/register",
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
router.post("/logout", verifyAccessToken, logoutController);

export default router;
