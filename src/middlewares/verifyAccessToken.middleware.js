// Packages
import jwt from "jsonwebtoken";

// Configs
import env from "../config/env.config.js";

// Utils
import AppError from "../utils/AppError.util.js";

const verifyAccessToken = (req, _, next) => {
    try {
        const authorizationHeader = req.headers?.authorization;

        if (!authorizationHeader) {
            throw new AppError("Unauthorized request", 401);
        }

        if (!authorizationHeader.startsWith("Bearer ")) {
            throw new AppError("Invalid access token format", 401);
        }

        const incomingAccessToken = authorizationHeader.split(" ")[1];

        if (!incomingAccessToken) {
            throw new AppError("Access token missing", 401);
        }

        const decodedToken = jwt.verify(
            incomingAccessToken,
            env.ACCESS_TOKEN_SECRET
        );

        req.user = {
            _id: decodedToken.sub,
            email: decodedToken.email,
        };

        next();
    } catch (error) {
        if(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError"){
            return next(new AppError("Invalid or expired access token", 401));
        }
        next(error);
    }
};

export default verifyAccessToken;