import connectDB from "#infra/database/connectDB.js";
import { logger } from "#shared/utils/index.js";

export default async function bootstrapDatabase() {
    try {
        await connectDB();

        logger.info("Database bootstrap completed");
    } catch (error) {
        logger.fatal({ err: error }, "Database bootstrap failed");

        throw error;
    }
}