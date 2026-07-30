import { buildUserResponse } from "./buildUserResponse.util";
import { generateAccessToken } from "./generateTokens.util";
import { saveRefreshToken } from "./saveRefreshToken.util";

export const createSession = async (user) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = await saveRefreshToken(user);

    return {
        userResponse: buildUserResponse(user),
        accessToken,
        refreshToken,
    };
};