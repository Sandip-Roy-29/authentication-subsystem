// Packages
import express from "express";

// Controller
import { refreshAccessTokenController } from "../controllers/refreshToken.controller.js";

// Middlewares
import verifyRefreshToken from "../middlewares/verifyRefreshToken.middleware.js";

const router = express.Router();

router.post("/", verifyRefreshToken, refreshAccessTokenController);

export default router;