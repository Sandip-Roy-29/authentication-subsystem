import redisClient from "#infra/redis/redis.client.js";
import {
    forgotPassword,
    googleLogin,
    loginUser,
    logout,
    register,
    resetPassword,
    refreshToken,
} from "../services/auth.service.js";
import {
    sendVerificationEmail,
    verifyEmailOtp,
    resendVerificationEmail,
} from "../services/emailVerification.service.js";
import { ApiResponse } from "#shared/utils/index.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookie.util.js";

export const registerController = async (req, res) => {
    const { name, email, password } = req.body;

    await sendVerificationEmail({ name, email, password, role: req.role });

    return res.status(200).json(
        ApiResponse.success({
            message: "Verification email sent successfully",
            requestId: req.requestId,
        })
    );
};

export const verificationEmailController = async (req, res) => {
    const { email, otp } = req.body;

    const data = await verifyEmailOtp({ email, otp });

    await redisClient.del(`email-verification:${email}`);
    await redisClient.del(`email-verification-cooldown:${email}`);

    const { userResponse, accessToken, refreshToken } = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
    });

    setAuthCookies(res, refreshToken);

    return res.status(201).json(
        ApiResponse.created({
            data: {
                id: userResponse.id,
                name: userResponse.name,
                email: userResponse.email,
                role: userResponse.role,
                accessToken: accessToken,
            },
            message: "User registered successfully",
            requestId: req.requestId,
        })
    );
};

export const resendVerificationEmailController = async (req, res) => {
    const { email } = req.body;

    await resendVerificationEmail(email);

    return res.status(200).json(
        ApiResponse.success({
            message: "Verification email sent successfully",
            requestId: req.requestId,
        })
    );
};

export const forgotPasswordController = async (req, res) => {
    const { email } = req.body;

    await forgotPassword({ email });

    return res.status(200).json(
        ApiResponse.success({
            message: "Password reset code sent successfully",
            requestId: req.requestId,
        })
    );
};

export const resetPasswordController = async (req, res) => {
    const { email, otp, password } = req.body;

    await resetPassword({ email, otp, password });

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
                id: userResponse.id,
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

export const googleLoginController = async (req, res) => {
    const { idToken } = req.body;

    const { userResponse, accessToken, refreshToken } = await googleLogin({
        idToken,
    });

    setAuthCookies(res, refreshToken);

    return res.status(200).json(
        ApiResponse.success({
            data: {
                ...userResponse,
                accessToken,
            },
            message: "Logged in successfully",
            requestId: req.requestId,
        })
    );
};

export const refreshTokenController = async (req, res) => {
    const { newAccessToken, newRefreshToken } = await refreshToken(req);

    setAuthCookies(res, newRefreshToken);

    return res.status(200).json(
        ApiResponse.success({
            data: {
                id: req.refreshTokenPayload.sub,
                email: req.refreshTokenPayload.email,
                accessToken: newAccessToken,
            },
            message: "Access token generated successfully",
            requestId: req.requestId,
        })
    );
};

export const logoutController = async (req, res) => {
    await logout(req.user);

    clearAuthCookies(res);

    return res.status(200).json(
        ApiResponse.success({
            message: "Logged out successfully",
            requestId: req.requestId,
        })
    );
};
