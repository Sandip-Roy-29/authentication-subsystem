import pino from "pino";
import env from "#env";

const logger = pino({
    level: env.NODE_ENV === "test" ? "silent" : "info",

    transport:
        env.NODE_ENV !== "test"
            ? {
                  target: "pino-pretty",
              }
            : undefined,
});

export default logger;
