import AppError from "../utils/AppError.util.js";

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError("Forbidden", 403));
        }
        next();
    };
};
