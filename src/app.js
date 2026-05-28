// packages
import express from "express";
import cookieParser from "cookie-parser";

//Routes
import healthRoute from "../src/routes/health.route.js";
import authRoute from "./routes/auth.route.js";
import meRoute from "./routes/me.route.js";
import refreshTokenRoute from "./routes/refreshToken.route.js";

// Middlewares
import requestLoggerMiddleware from "./middlewares/requestLogger.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import requestIdMiddleware from "./middlewares/requestId.middleware.js";
import verifyAccessToken from "./middlewares/verifyAccessToken.middleware.js";

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(cookieParser());

app.use("/health", healthRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/me", verifyAccessToken, meRoute);
app.use("/api/v1/refresh-token", refreshTokenRoute);

app.use(errorMiddleware);

export default app;
