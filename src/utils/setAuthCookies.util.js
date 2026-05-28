import env from "../config/env.config.js";

const setAuthCookies = (res, refreshToken) => {
    res.cookie(
        "refreshToken",
        refreshToken,
        {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        }
    );
};

export default setAuthCookies;