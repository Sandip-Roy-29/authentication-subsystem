import mongoose from "mongoose";
import env from "#env";
import logger from "#shared/utils/logger.util.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(env.MONGODB_URI, {
            maxPoolSize: env.DB_MAX_POOL_SIZE | 10,
            minPoolSize: env.DB_MIN_POOL_SIZE | 0,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
        });
        logger.info(
            {
                host: connectionInstance.connection.host,
                dbName: connectionInstance.connection.name,
            },
            "MONGODB connected"
        );

        return connectionInstance;
    } catch (error) {
        logger.fatal(
            {
                err: error,
                uri: env.MONGODB_URI ? "SET" : "MISSING",
            },
            "MONGODB connection failed"
        );

        process.exit(1);
    }
};

export default connectDB;
