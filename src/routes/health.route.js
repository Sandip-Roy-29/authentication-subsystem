import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req,res) => {
    const dbState = mongoose.connection.readyState;

    const dbStatus = dbState === 1 ? "Connected" : "Disconnected";

    res.status(200).json({
        success: true,
        server: "running",
        database: dbStatus
    })
})

export default router;