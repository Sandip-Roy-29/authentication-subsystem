import bootstrapMail from "./mail.bootstrap.js";
import { logger } from "#shared/utils/index.js";

export default async function optionalBootstrap() {
    try {
        await bootstrapMail();
    } catch (error) {
        logger.error(
            { err: error },
            "Mail bootstrap failed. Continuing without mail service."
        );
    }
}