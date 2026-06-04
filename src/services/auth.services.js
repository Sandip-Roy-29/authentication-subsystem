// Models
import { User } from "../models/user.model.js";

// Utils
import AppError from "../utils/AppError.util.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateTokens.util.js";

export const registerUser = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("User already exist", 409);
    }

    const user = new User({
        name: name,
        email: email,
        password: password,
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
    };

    return { userResponse, accessToken, refreshToken };
};
