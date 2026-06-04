// Models
import { User } from "../models/user.model.js";

// Utils
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateTokens.util.js";

export const generateNewTokens = async (req) => {
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
