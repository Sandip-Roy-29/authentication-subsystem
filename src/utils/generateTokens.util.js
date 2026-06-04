import jwt from "jsonwebtoken";
import env from "../config/env.config.js";
import crypto from "crypto";

const payloadBuilder = (user) => ({
    sub: user._id.toString(),
    email: user.email,
    jti: crypto.randomUUID(),
});

export const generateAccessToken = (user) => {
    return jwt.sign(payloadBuilder(user), env.ACCESS_TOKEN_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRY,
    });
};

export const generateRefreshToken = (user) => {
    return jwt.sign(payloadBuilder(user), env.REFRESH_TOKEN_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRY,
    });
};
