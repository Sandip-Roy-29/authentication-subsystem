import { randomUUID } from "crypto";

const requestIdMiddleware = (req, res, next) => {
    const requestId = randomUUID();
    req.requestId = requestId;

    res.setHeader("X-Request-Id", requestId);

    next();
};

export default requestIdMiddleware;
