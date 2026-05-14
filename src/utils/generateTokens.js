import jwt from "jsonwebtoken";
import env from "../config/env.js";

const payloadBuilder = (user) => ({
    sub: user._id.toString(),
    email: user.email
});

export const generateAccessToken = (user) => {
    return jwt.sign(
        payloadBuilder(user),
        env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRY
        },
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        payloadBuilder(user),
        env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: env.REFRESH_TOKEN_EXPIRY
        }
    );
};