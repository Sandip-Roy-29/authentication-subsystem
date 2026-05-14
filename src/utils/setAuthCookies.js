import env from "../config/env.js";

export const setAuthCookies = (res, accessToken) => {
    res.cookies(
        "accessToken", 
        accessToken,
        {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        }
    );
};