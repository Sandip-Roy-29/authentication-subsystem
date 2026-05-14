import express from "express";
import { registerController } from "../controllers/auth.controller.js";
import { loginController } from "../controllers/auth.controller.js";
import { registerSchema } from "../validations/auth.validation.js";
import { loginSchema } from "../validations/auth.validation.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.post("/register",validate(registerSchema), registerController);
router.post("/login",validate(loginSchema), loginController);

export default router;