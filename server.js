import app from "./src/app.js";
import env from "./src/config/env.js";
import connectDB from "./src/db/connectDB.js";
import disconnectDB from "./src/db/disconnectDB.js";
import logger from "./src/utils/logger.js";

let httpServer;

const graceFullShutdown = async (signal) => {
    try {
        logger.info(`${signal} received. Starting gracefull shutdown`);

        if(server){
            serer.close(() => {
                logger.info("HTTP server closed");
            })
        }

        await disconnectDB();

        logger.info("Database disconnected");

        process.exit(0);
    } catch (error) {
        logger.fatal({err: error},"Error during gracefull shutdown");

        process.exit(1);
    }
}

process.on(
    "unhandledRejection",
    (error) => {
        logger.error({err: error},"Unhandled rejection");
        
        process.exit(1);
    }
)

process.on(
    "uncaughtException",
    (error) => {
        logger.error({err: error},"Uncaught exception");
        
        process.exit(1);
    }
)

process.on(
    "SIGINT",
    () => graceFullShutdown("SIGINT")
)

process.on(
    "SIGTERM",
    () => graceFullShutdown("SIGTERM")
)

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(env.PORT, () => {
            logger.info(`App listening on port ${env.PORT}`);  
        })
    } catch (error) {
        logger.error({err: error},"Server startup failed");
                
        process.exit(1);
    }
}

startServer();