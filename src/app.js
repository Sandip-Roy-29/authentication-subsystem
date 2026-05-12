import express from "express";
import healthRoute from "../src/routes/health.route.js"

const app = express();

app.use(express.json())

app.use("/health", healthRoute);

export default app;