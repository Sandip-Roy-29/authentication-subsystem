import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
        return res.status(503).json({
            success: false,
            server: "running",
            database: "Disconnected",
        });
    }

    res.status(200).json({
        success: true,
        server: "running",
        database: "Connected",
    });
});

export default router;