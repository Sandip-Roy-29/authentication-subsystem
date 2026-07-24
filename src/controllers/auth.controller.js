// Configs
import env from "../config/env.config.js";
import redisClient from "../config/redis.config.js";

// Services
import { forgotPassword, loginUser, register, resetPassword } from "../services/auth.services.js";
import { sendVerificationEmail, verifyEmailOtp, resendVerificationEmail } from "../services/emailVerification.service.js";

// Utils
import ApiResponse from "../utils/ApiResponse.util.js";
import setAuthCookies from "../utils/setAuthCookies.util.js";

//Model
import { User } from "../models/user.model.js";

export const userRegisterController = async (req, res) => {
    const { name, email, password } = req.body;
    const role = "user";

    await sendVerificationEmail({name, email, password, role});

    return res.status(200).json(
        ApiResponse.success({
            message: "Verification email sent successfully",
            requestId: req.requestId,
        })
    );
};

export const adminRegisterController = async (req, res) => {
    const { name, email, password } = req.body;
    const role = "admin";

    await sendVerificationEmail({name, email, password, role});

    return res.status(200).json(
        ApiResponse.success({
            message: "Verification email sent successfully",
            requestId: req.requestId,
        })
    );
};

export const verificationEmailController = async (req, res) => {
    const {email, otp} = req.body;

    const data = await verifyEmailOtp({email, otp});

    await redisClient.del(`email-verification:${email}`);
    await redisClient.del(`email-verification-cooldown:${email}`);

    const { user, accessToken, refreshToken } = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
    });

    setAuthCookies(res, refreshToken);

    return res.status(201).json(
        ApiResponse.created({
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken: accessToken,
            },
            message: "User registered successfully",
            requestId: req.requestId,
        })
    );
};

export const resendVerificationEmailController = async (req, res) => {
    const {email} = req.body;

    await resendVerificationEmail({email});

    return res.status(200).json(
        ApiResponse.success({
            message: "Verification email sent successfully",
            requestId: req.requestId,
        })
    );
};

export const forgotPasswordController = async (req, res) => {
    const {email} = req.body;

    await forgotPassword({email});

    return res.status(200).json(
        ApiResponse.success({
            message: "Password reset code sent successfully",
            requestId: req.requestId,
        })
    );
};

export const resetPasswordController = async (req, res) => {
    const {email, otp, password} = req.body;

    await resetPassword({email, otp, password});

    return res.status(200).json(
        ApiResponse.success({
            message: "Password reset successfully",
            requestId: req.requestId,
        })
    );
};

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    const { userResponse, accessToken, refreshToken } = await loginUser({
        email,
        password,
    });

    setAuthCookies(res, refreshToken);

    return res.status(200).json(
        ApiResponse.success({
            data: {
                id: userResponse._id,
                name: userResponse.name,
                email: userResponse.email,
                role: userResponse.role,
                accessToken: accessToken,
            },
            message: "User logged in successfully",
            requestId: req.requestId,
        })
    );
};

export const logoutController = async (req, res) => {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 },
    });

    const remainingTime = req.user.exp - Math.floor(Date.now() / 1000);

    await redisClient.set(`blacklist:${req.user.jti}`, "revoked", {
        EX: remainingTime,
    });

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
