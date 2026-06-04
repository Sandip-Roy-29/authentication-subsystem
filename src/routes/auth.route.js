// Packages
import express from "express";

// Controller
import { registerController } from "../controllers/auth.controller.js";
import { loginController } from "../controllers/auth.controller.js";
import { logoutController } from "../controllers/auth.controller.js";

// Validation
import { registerSchema } from "../validations/auth.validation.js";
import { loginSchema } from "../validations/auth.validation.js";
import verifyAccessToken from "../middlewares/verifyAccessToken.middleware.js";

// Configs
import {
    loginRateLimiter,
    registerRateLimiter,
} from "../config/rateLimit.config.js";

// Middlewares
import validateMiddleware from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
    "/register",
    registerRateLimiter,
    validateMiddleware(registerSchema),
    registerController
);
router.post(
    "/login",
    loginRateLimiter,
    validateMiddleware(loginSchema),
    loginController
);
router.post("/logout", verifyAccessToken, logoutController);

export default router;
