import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            id: req.user.sub,
            email: req.user.email,
        },
        requestId: req.requestId,
    });
});

export default router;
