import { logger } from "../utils/index.js";

const requestLoggerMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const responseTime = Date.now() - start;

        const logData = {
            requestId: req.requestId,
            method: req.method,
            route: req.originalUrl,
            statuscode: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        };

        if (res.statusCode >= 500) {
            logger.error(logData, "Server error response");
        } else if (res.statusCode >= 400) {
            logger.warn(logData, "Client error response");
        } else {
            logger.info(logData, "Request completed");
        }
    });

    next();
};

export default requestLoggerMiddleware;
