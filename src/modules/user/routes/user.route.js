import express from "express";
import { authorize, verifyAccessToken } from "../../auth/middlewares/index.js";
import { validateMiddleware } from "#shared/middlewares/index.js";
import {
    deleteUserController,
    getUsersController,
    updateRoleController,
} from "../controllers/user.controller.js";
import { updateRoleSchema } from "../validators/user.validation.js";

export default function createUserRouter(rateLimiters) {
    const {
        adminRateLimiter,
    } = rateLimiters;

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

    return router;
}
