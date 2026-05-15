import env from "../config/env.config.js";

const setAuthCookies = (res, accessToken) => {
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

export default setAuthCookies;