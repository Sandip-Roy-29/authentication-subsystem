import express from "express";
import { adminRateLimiter } from "../../auth/rateLimiter.js";
import { authorize, verifyAccessToken } from "../../auth/middlewares";
import { validateMiddleware } from "#shared/middlewares";
import {
    deleteUserController,
    getUsersController,
    updateRoleController,
} from "../controllers/user.controller.js";
import { updateRoleSchema } from "../validators/user.validation.js";

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
