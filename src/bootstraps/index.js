import bootstrapDatabase from "./database.bootstrap.js";
import bootstrapRedis from "./redis.bootstrap.js";
import bootstrapMail from "./mail.bootstrap.js";
import { logger } from "#shared/utils/index.js";

export default async function bootstrap() {
    try {
        await bootstrapDatabase();
        await bootstrapRedis();
        await bootstrapMail();

        logger.info("Application bootstrap completed");
    } catch (error) {
        logger.fatal({ err: error }, "Application bootstrap failed");

        throw error;
    }
}