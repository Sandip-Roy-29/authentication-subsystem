import jwt from "jsonwebtoken";
import env from "#env";
import redisClient from "#infra/redis/redis.client.js";
import { AppError } from "#shared/utils";

const verifyAccessToken = async (req, _, next) => {
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

        const revoked = await redisClient.get(`blacklist:${decodedToken.jti}`);

        if (revoked) {
            throw new AppError("Token revoked", 401);
        }

        req.user = {
            _id: decodedToken.sub,
            email: decodedToken.email,
            role: decodedToken.role,
            exp: decodedToken.exp,
            jti: decodedToken.jti,
        };

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return next(new AppError("Invalid or expired access token", 401));
        }
        next(error);
    }
};

export default verifyAccessToken;
