import { buildUserResponse } from "./buildUserResponse.util.js";
import { generateAccessToken } from "./generateTokens.util.js";
import { saveRefreshToken } from "./saveRefreshToken.util.js";

export const createSession = async (user) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = await saveRefreshToken(user);

    return {
        userResponse: buildUserResponse(user),
        accessToken,
        refreshToken,
    };
};