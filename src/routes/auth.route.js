// Packages
import express from "express";

// Controller
import { registerController } from "../controllers/auth.controller.js";
import { loginController } from "../controllers/auth.controller.js";
import { logoutController } from "../controllers/auth.controller.js";

// Validation
import { registerSchema } from "../validations/auth.validation.js";
import { loginSchema } from "../validations/auth.validation.js";

// Middlewares
import validateMiddleware from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register",validateMiddleware(registerSchema), registerController);
router.post("/login",validateMiddleware(loginSchema), loginController);
router.post("/logout", authMiddleware, logoutController);

export default router;