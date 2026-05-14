import jwt from "jsonwebtoken";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";

export const authMiddleware = (req, _, next) => {
    try {
        const incomingAccessToken = req.cookies?.accessToken;

        if (!incomingAccessToken) {
            throw new AppError("Unauthorized request", 401);
        }

        const decodedToken = jwt.verify(
            incomingAccessToken,
            env.ACCESS_TOKEN_SECRET
        );

        req.user = decodedToken;

        next();
    } catch (error) {
        if(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError"){
            return next(new AppError("Invalid or expired token", 401));
        }
        next(error);
    }
};
