import env from "#env";
import redisClient from "#infra/redis/redis.client.js";
import disconnectDB from "#infra/database/disconnectDB.js";
import { logger } from "#shared/utils/index.js";
import bootstrap from "#bootstrap";
import createApplication from "./src/composition/createApplication.js";

let httpServer;
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`${signal} received. Starting graceful shutdown`);

    const forceShutdownTimer = setTimeout(() => {
        logger.error("Graceful shutdown timed out. Forcing exit.");
        process.exit(1);
    }, 10_000);

    try {
        if (httpServer) {
            await new Promise((resolve, reject) => {
                httpServer.close((err) => {
                    if (err) return reject(err);

                    logger.info("HTTP server closed");
                    resolve();
                });
            });
        }

        if (redisClient.isOpen) {
            await redisClient.quit();
            logger.info("Redis disconnected");
        }

        await disconnectDB();

        clearTimeout(forceShutdownTimer);

        logger.info("Graceful shutdown completed");

        process.exitCode = 0;
    } catch (error) {
        clearTimeout(forceShutdownTimer);

        logger.fatal({ err: error }, "Error occurred during graceful shutdown");

        process.exitCode = 1;
    }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (error) => {
    logger.fatal({ err: error }, "Unhandled promise rejection");
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception");
    process.exit(1);
});

const startServer = async () => {
    try {
        await bootstrap();

        const app = createApplication();

        httpServer = app.listen(env.PORT, () => {
            logger.info(`App listening on port ${env.PORT}`);
        });
    } catch (error) {
        logger.fatal({ err: error }, "Server startup failed");
        process.exit(1);
    }
};

startServer();
