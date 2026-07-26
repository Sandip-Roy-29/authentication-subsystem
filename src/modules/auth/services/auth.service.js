import { User } from "../../user/models/user.model.js";
import { AppError, generateOtp } from "#shared/utils";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateTokens.util.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.util.js";
import redisClient from "#infra/redis/redis.client.js";
import googleClient from "#infra/passport/google.client.js";
import env from "#env";

export const register = async ({ name, email, password, role }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("User already exist", 409);
    }

    const user = new User({
        name: name,
        email: email,
        password: password,
        role,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await user.save();

    return { user, accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new AppError("User does not exist", 404);
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new AppError("Invalid credentials", 401);
    }

    const refreshToken = generateRefreshToken(user);
    const accessToken = generateAccessToken(user);

    user.refreshToken = {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await user.save();

    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    return { userResponse, accessToken, refreshToken };
};

export const googleLogin = async ({ idToken }) => {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub: googleId, email, name, email_verified } = payload;

    if (!email_verified) {
        throw new AppError("Google email is not verified", 401);
    }

    let user = await User.findOne({ email });

    if (!user) {
        user = new User({
            name,
            email,
            provider: "google",
            googleId,
            role: "user",
            isEmailVerified: true,
        });
    } else if (user.provider === "local") {
        user.provider = "google";
        user.googleId = googleId;
        user.isEmailVerified = true;
    } else if (user.googleId !== googleId) {
        throw new AppError("Google account mismatch", 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await user.save();

    return {
        userResponse: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        accessToken,
        refreshToken,
    };
};

export const forgotPassword = async ({ email }) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const cooldown = await redisClient.get(`password-reset-cooldown:${email}`);

    if (cooldown) {
        throw new AppError(
            "Please wait before requesting another verification code.",
            429
        );
    }

    const otp = generateOtp();

    await redisClient.set(
        `password-reset:${email}`,
        JSON.stringify({
            userId: user._id,
            otp,
        }),
        {
            EX: 600,
        }
    );

    await redisClient.set(`password-reset-cooldown:${email}`, "1", {
        EX: 60,
    });
    await sendOtpEmail({
        email,
        otp,
    });
};

export const resetPassword = async ({ email, otp, password }) => {
    const pendingReset = await redisClient.get(`password-reset:${email}`);

    if (!pendingReset) {
        throw new AppError("Password reset session expired", 400);
    }

    const data = JSON.parse(pendingReset);

    if (data.otp !== otp) {
        throw new AppError("Invalid verification code", 400);
    }

    const user = await User.findById(data.userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.password = password;
    user.refreshToken = undefined;

    await user.save();

    await redisClient.del(`password-reset:${email}`);
    await redisClient.del(`password-reset-cooldown:${email}`);
};

export const refreshToken = async (req) => {
    const newAccessToken = generateAccessToken({
        _id: req.refreshTokenPayload.sub,
        email: req.refreshTokenPayload.email,
    });

    const newRefreshToken = generateRefreshToken({
        _id: req.refreshTokenPayload.sub,
        email: req.refreshTokenPayload.email,
    });

    const user = await User.findById(req.refreshTokenPayload.sub).select(
        "+refreshToken.token"
    );

    user.refreshToken = {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await user.save();

    return { newAccessToken, newRefreshToken };
};

export const logout = async (user) => {
    await User.findByIdAndUpdate(user._id, {
        $unset: { refreshToken: 1 },
    });

    const remainingTime = user.exp - Math.floor(Date.now() / 1000);

    await redisClient.set(`blacklist:${user.jti}`, "revoked", {
        EX: remainingTime,
    });
};
