// Packages
import jwt from "jsonwebtoken";

// Configs
import env from "../config/env.config.js";
import redisClient from "../config/redis.config.js";

// Utils
import AppError from "../utils/AppError.util.js";

const verifyAccessToken = async(req, _, next) => {
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

        if(revoked){
            throw new AppError("Token revoked", 401);
        }        

        req.user = {
            _id: decodedToken.sub,
            email: decodedToken.email,
            exp: decodedToken.exp,
            jti: decodedToken.jti
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