import logger from "../utils/logger.js";
import env from "../config/env.js";

const errorMiddleware = (error, req, res, next) => {
    const statusCode = req.statusCode || 500;

    logger.error(
        {
            err: error,
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
        },
        error.message || "Unhandled application error"
    );

    const response = {
        success: false,
        message: statusCode === 500 ? "Internal server error" : error.message,
        statusCode,
        error: {
            type: error.name || "Error",
        },
        timeStamp: new Date().toISOString(),
        requestId: req.requestId || null,
    };

    if (env.NODE_ENV === "development") response.stack = error.stack;

    res.statusCode(statusCode).json(response);

    next();
};

export default errorMiddleware;
