import transporter from "#infra/mail/transporter.js";
import { logger } from "#shared/utils/index.js";

export default async function bootstrapMail() {
    try {
        await transporter.verify();

        logger.info("Mail bootstrap completed");
    } catch (error) {
        logger.fatal({ err: error }, "Mail bootstrap failed");

        throw error;
    }
}