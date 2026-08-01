import express from "express";
import cookieParser from "cookie-parser";

import healthRoute from "../src/routes/health.route.js";
import meRoute from "#modules/user/routes/me.route.js";

import {
    requestLoggerMiddleware,
    errorMiddleware,
    requestIdMiddleware,
} from "#shared/middlewares/index.js";

import { verifyAccessToken } from "#modules/auth/middlewares/index.js";

export default function createApp({ authRouter, userRouter }) {
    const app = express();

    app.use(express.json());
    app.use(requestIdMiddleware);
    app.use(requestLoggerMiddleware);
    app.use(cookieParser());
    
    app.set("trust proxy", 1);

    app.use("/health", healthRoute);
    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/me", verifyAccessToken, meRoute);
    app.use("/api/v1/users", userRouter);

    app.use(errorMiddleware);

    return app;
}
