// Configs
import express from "express";
import { adminRateLimiter } from "../config/rateLimit.config.js";

// Middlewares
import verifyAccessToken from "../middlewares/verifyAccessToken.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

// Controllers
import {
    deleteUserController,
    getUsersController,
    updateRoleController,
} from "../controllers/user.controller.js";

//Validation
import { updateRoleSchema } from "../validations/user.validation.js";

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

router.patch(
    "/:userId/role",
    verifyAccessToken,
    authorize("admin"),
    adminRateLimiter,
    validateMiddleware(updateRoleSchema),
    updateRoleController
);

export default router;
