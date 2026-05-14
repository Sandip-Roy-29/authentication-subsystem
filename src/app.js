import express from "express";
import healthRoute from "../src/routes/health.route.js";
import requestLogger from "./middlewares/requestLogger.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import requestIdMiddleware from "./middlewares/requestIdMiddleware.js";
import authRoute from "./routes/auth.route.js";

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger);

app.use("/health", healthRoute);
app.use("/api/v1/auth",authRoute);

app.use(errorMiddleware);

export default app;
