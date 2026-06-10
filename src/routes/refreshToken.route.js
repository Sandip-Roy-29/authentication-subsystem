// Packages
import express from "express";

// Controller
import { refreshAccessTokenController } from "../controllers/refreshToken.controller.js";

// Middlewares
import verifyRefreshToken from "../middlewares/verifyRefreshToken.middleware.js";

// Configs
import { refreshTokenRateLimiter } from "../config/rateLimit.config.js";

const router = express.Router();

router.post(
    "/",
    verifyRefreshToken,
    refreshTokenRateLimiter,
    refreshAccessTokenController
);

export default router;
