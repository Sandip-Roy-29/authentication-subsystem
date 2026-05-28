// Packages
import jwt from "jsonwebtoken";

// Configs
import env from "../config/env.config.js";

// Utils
import AppError from "../utils/AppError.util.js";

// Models
import { User } from "../models/user.model.js";

const verifyRefreshToken = async (req, _, next) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;

        if (!incomingRefreshToken) {
            throw new AppError("Refresh token missing", 401);
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken.sub).select("+refreshToken.token");

        if(!user){
            throw new AppError("Unauthorized request", 401);
        };

        if(!user.refreshToken || !user.refreshToken.token){
            throw new AppError("Refresh token does not exit", 401);
        }

        if(user.refreshToken.expiresAt.getTime() < Date.now()){
            throw new AppError("Expired refresh token", 401);
        };
        
        const isRefreshTokenValid = await user.compareRefreshToken(incomingRefreshToken);

        if(!isRefreshTokenValid){
            throw new AppError("Invalid refresh token", 401);
        }

        req.refreshTokenPayload = decodedToken;

        next();
    } catch (error) {
        if(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError"){
            return next(new AppError("Invalid or expired token", 401));
        }
        next(error);
    }
};

export default verifyRefreshToken;