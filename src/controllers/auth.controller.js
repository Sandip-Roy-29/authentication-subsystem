// Configs
import env from "../config/env.config.js";
import redisClient from "../config/redis.config.js";

// Services
import { registerUser } from "../services/auth.services.js";
import { loginUser } from "../services/auth.services.js";

// Utils
import ApiResponse from "../utils/ApiResponse.util.js";
import setAuthCookies from "../utils/setAuthCookies.util.js";

//Model
import { User } from "../models/user.model.js";

export const registerController = async (req, res) => {
    const { name, email, password } = req.body;

    const { user, accessToken, refreshToken } = await registerUser({ name, email, password });
    setAuthCookies(res, refreshToken);
        
    return res.status(201).json(
        ApiResponse.created({
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                accessToken: accessToken
            },
            message: "User registered successfully",
            requestId: req.requestId,
        })
    );
};

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    const { userResponse, accessToken, refreshToken} = await loginUser({ email, password });

    setAuthCookies(res, refreshToken);

    return res.status(200).json(
        ApiResponse.success({
            data: {
                id: userResponse._id,
                name: userResponse.name,
                email: userResponse.email,
                accessToken: accessToken,
            },
            message: "User logged in successfully",
            requestId: req.requestId,
        })
    );
};

export const logoutController = async (req, res) => {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId,{
        $unset: { refreshToken: 1 }
    });    

    const remainingTime = req.user.exp - Math.floor(Date.now()/1000);

    await redisClient.set(
        `blacklist:${req.user.jti}`,
        "revoked",
        {
            EX: remainingTime
        }
    );    

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json(
        ApiResponse.success({
            message: "Logged out successfully",
            requestId: req.requestId,
        })
    );
};
