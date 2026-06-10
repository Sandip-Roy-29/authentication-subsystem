// Configs
import express from "express";
import { adminRateLimiter } from "../config/rateLimit.config.js";

// Middlewares
import verifyAccessToken from "../middlewares/verifyAccessToken.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";

// Controllers
import {
    deleteUserController,
    getUsersController,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get(
    "/",
    verifyAccessToken,
    authorize("admin"),
    adminRateLimiter,
    getUsersController
);

router.delete(
    "/:userId",
    verifyAccessToken,
    authorize("admin"),
    adminRateLimiter,
    deleteUserController
);

export default router;
