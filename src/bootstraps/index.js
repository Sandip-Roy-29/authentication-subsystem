import criticalBootstrap from "./critical/index.js";
import optionalBootstrap from "./optional/index.js";
import { logger } from "#shared/utils/index.js";

export default async function bootstrap() {
    try {
        await criticalBootstrap();

        await optionalBootstrap();

        logger.info("Application bootstrap completed");
    } catch (error) {
        logger.fatal(
            { err: error },
            "Application bootstrap failed"
        );

        throw error;
    }
}