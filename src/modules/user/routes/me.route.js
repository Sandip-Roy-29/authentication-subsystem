import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role,
        },
        requestId: req.requestId,
    });
});

export default router;
