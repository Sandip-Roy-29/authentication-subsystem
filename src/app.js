import express from "express";
import healthRoute from "../src/routes/health.route.js"
import requestLogger from "./middlewares/requestLogger.js";

const app = express();

app.use(express.json());
app.use(requestLogger)

app.use("/health", healthRoute);

export default app;