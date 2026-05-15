// Configs
import env from "../config/env.config.js";

// Services
import { registerUser } from "../services/auth.services.js";
import { loginUser } from "../services/auth.services.js";

// Utils
import ApiResponse from "../utils/ApiResponse.util.js";
import { generateAccessToken } from "../utils/generateTokens.util.js";
import setAuthCookies from "../utils/setAuthCookies.util.js";

export const registerController = async (req, res) => {
    const { name, email, password } = req.body;

    const user = await registerUser({ name, email, password });

    const accessToken = generateAccessToken(user);

    setAuthCookies(res, accessToken);

    return res.status(201).json(
        ApiResponse.created({
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            message: "User registered successfully",
            requestId: req.requestId,
        })
    );
};

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    const user = await loginUser({ email, password });

    const accessToken = generateAccessToken(user);

    setAuthCookies(res, accessToken);

    return res.status(200).json(
        ApiResponse.success({
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            message: "User logged in successfully",
            requestId: req.requestId,
        })
    );
};

export const logoutController = (req, res) => {
    res.clearCookie("accessToken", {
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
