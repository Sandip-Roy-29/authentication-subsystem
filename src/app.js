import express from "express";
import cookieParser from "cookie-parser";
import healthRoute from "../src/routes/health.route.js";
import authRoute from "#modules/auth/routes/auth.route.js";
import meRoute from "#modules/user/routes/me.route.js";
import userRoute from "#modules/user/routes/user.route.js";

import {
    requestLoggerMiddleware,
    errorMiddleware,
    requestIdMiddleware,
} from "#shared/middlewares";
import { verifyAccessToken } from "#modules/auth/middlewares";

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(cookieParser());
app.set("trust proxy", 1);

app.use("/health", healthRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/me", verifyAccessToken, meRoute);
app.use("/api/v1/users", userRoute);

app.use(errorMiddleware);

export default app;
