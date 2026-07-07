// Packages
import express from "express";

// Controller
import { userRegisterController, adminRegisterController, loginController,logoutController, verificationEmailController } from "../controllers/auth.controller.js";

// Validation
import { registerSchema, registrationVerificationSchema, resendVerificationSchema } from "../validations/auth.validation.js";
import { loginSchema } from "../validations/auth.validation.js";
import verifyAccessToken from "../middlewares/verifyAccessToken.middleware.js";

// Configs
import {
    adminRateLimiter,
    loginRateLimiter,
    registerRateLimiter,
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
    
);
router.post(
    "/login",
    validateMiddleware(loginSchema),
    loginRateLimiter,
    loginController
);
router.post("/logout", verifyAccessToken, logoutController);

export default router;
