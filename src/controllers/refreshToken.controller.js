// Services
import { generateNewTokens } from "../services/refreshAccessToken.service.js";

// Utils
import ApiResponse from "../utils/ApiResponse.util.js";
import setAuthCookies from "../utils/setAuthCookies.util.js";

export const refreshAccessTokenController = async (req, res) => {
    const { newAccessToken, newRefreshToken } = await generateNewTokens(req);

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
