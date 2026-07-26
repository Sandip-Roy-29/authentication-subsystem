import { z } from "zod";

export const emailSchema = z.object({
    SMTP_HOST: z.coerce.string({
        required_error: "SMTP_HOST is required",
    }),

    SMTP_PORT: z.coerce
        .number({
            invalid_type_error: "PORT must be a valid number",
        })
        .min(1, "PORT must be greater than 0")
        .max(65535, "PORT must be less than 65535")
        .int("PORT must be integer")
        .default(587),

    SMTP_EMAIL: z.coerce
        .string({
            required_error: "SMTP_EMAIL is required",
        })
        .email("Invalid SMTP_EMAIL"),

    SMTP_PASSWORD: z
        .string({
            required_error: "SMTP_PASSWORD is required",
        })
        .min(1, "SMTP_PASSWORD cannot be empty"),
});
