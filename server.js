import app from "./src/app.js";
import env from "#env";
import transporter from "#infra/mail/transporter.js";
import redisClient from "#infra/redis/redis.client.js";

import connectDB from "#infra/database/connectDB.js";
import disconnectDB from "#infra/database/disconnectDB.js";

import { logger } from "#shared/utils";

let httpServer;

const graceFullShutdown = async (signal) => {
    try {
        logger.info(`${signal} received. Starting gracefull shutdown`);

        if (httpServer) {
            httpServer.close(() => {
                logger.info("HTTP server closed");
            });
        }

        await redisClient.quit();
        await disconnectDB();

        logger.info("Database disconnected");

        process.exit(0);
    } catch (error) {
        logger.fatal({ err: error }, "Error during gracefull shutdown");

        process.exit(1);
    }
};

process.on("unhandledRejection", (error) => {
    logger.error({ err: error }, "Unhandled rejection");

    process.exit(1);
});

process.on("uncaughtException", (error) => {
    logger.error({ err: error }, "Uncaught exception");

    process.exit(1);
});

process.on("SIGINT", () => graceFullShutdown("SIGINT"));

process.on("SIGTERM", () => graceFullShutdown("SIGTERM"));

const startServer = async () => {
    try {
        await connectDB();
        await redisClient.connect();
        await transporter.verify();

        httpServer = app.listen(env.PORT, () => {
            logger.info(`App listening on port ${env.PORT}`);
        });
    } catch (error) {
        logger.error({ err: error }, "Server startup failed");

        process.exit(1);
    }
};

startServer();
