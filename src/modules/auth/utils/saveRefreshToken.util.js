import { generateRefreshToken } from "./generateTokens.util.js";

const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export const saveRefreshToken = async (user) => {
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = {
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    };

    await user.save();

    return refreshToken;
};