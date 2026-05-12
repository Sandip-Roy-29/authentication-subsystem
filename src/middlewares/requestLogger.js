import logger from "../utils/logger.js";
import crypto from "crypto";

const requestLogger = (req, res, next) => {
    const start = Date.now();

    const requestId = crypto.randomUUID();
    req.requestId = requestId;

    res.setHeader("X-Request=Id", requestId);

    res.on("finish", () => {
        const responseTime = Date.now - start;

        const logData = {
            requestId,
            method: req.method,
            route: req.originalUrl,
            statuscode: req.statuscode,
            responseTime: `${responseTime}ms`,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        };
            
        if(res.statuscode >= 500){
            logger.error(logData,"Server error response")
        } else if(res.statuscode >= 400){
            logger.warn(logData,"Client error response")
        } else{
            logger.info(logData,"Request completed")
        }
    })

    next()
}

export default requestLogger;