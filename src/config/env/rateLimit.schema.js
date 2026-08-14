import { z } from "zod";

export const rateLimitSchema = z.object({
    LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "LOGIN_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("LOGIN_RATE_LIMIT_WINDOW_MS must be positive")
        .int("LOGIN_RATE_LIMIT_WINDOW_MS must be integer"),

    LOGIN_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error: "LOGIN_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("LOGIN_RATE_LIMIT_MAX must be positive")
        .int("LOGIN_RATE_LIMIT_MAX must be integer"),

    REGISTER_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "REGISTER_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("REGISTER_RATE_LIMIT_WINDOW_MS must be positive")
        .int("REGISTER_RATE_LIMIT_WINDOW_MS must be integer"),

    REGISTER_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error:
                "REGISTER_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("REGISTER_RATE_LIMIT_MAX must be positive")
        .int("REGISTER_RATE_LIMIT_MAX must be integer"),

    REFRESH_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "REFRESH_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("REFRESH_RATE_LIMIT_WINDOW_MS must be positive")
        .int("REFRESH_RATE_LIMIT_WINDOW_MS must be integer"),

    REFRESH_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error: "REFRESH_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("REFRESH_RATE_LIMIT_MAX must be positive")
        .int("REFRESH_RATE_LIMIT_MAX must be integer"),
    ADMIN_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "ADMIN_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("ADMIN_RATE_LIMIT_WINDOW_MS must be positive")
        .int("ADMIN_RATE_LIMIT_WINDOW_MS must be integer"),

    ADMIN_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error: "ADMIN_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("ADMIN_RATE_LIMIT_MAX must be positive")
        .int("ADMIN_RATE_LIMIT_MAX must be integer"),
    VERIFICATION_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "VERIFICATION_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("VERIFICATION_RATE_LIMIT_WINDOW_MS must be positive")
        .int("VERIFICATION_RATE_LIMIT_WINDOW_MS must be integer"),

    VERIFICATION_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error:
                "VERIFICATION_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("VERIFICATION_RATE_LIMIT_MAX must be positive")
        .int("VERIFICATION_RATE_LIMIT_MAX must be integer"),
    RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS must be positive")
        .int("RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS must be integer"),

    RESEND_VERIFICATION_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error:
                "RESEND_VERIFICATION_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("RESEND_VERIFICATION_RATE_LIMIT_MAX must be positive")
        .int("RESEND_VERIFICATION_RATE_LIMIT_MAX must be integer"),
    FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS must be positive")
        .int("FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS must be integer"),

    FORGOT_PASSWORD_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error:
                "FORGOT_PASSWORD_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("FORGOT_PASSWORD_RATE_LIMIT_MAX must be positive")
        .int("FORGOT_PASSWORD_RATE_LIMIT_MAX must be integer"),
    RESET_PASSWORD_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "RESET_PASSWORD_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("RESET_PASSWORD_RATE_LIMIT_WINDOW_MS must be positive")
        .int("RESET_PASSWORD_RATE_LIMIT_WINDOW_MS must be integer"),

    RESET_PASSWORD_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error:
                "RESET_PASSWORD_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("RESET_PASSWORD_RATE_LIMIT_MAX must be positive")
        .int("RESET_PASSWORD_RATE_LIMIT_MAX must be integer"),

    GOOGLE_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "GOOGLE_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("GOOGLE_RATE_LIMIT_WINDOW_MS must be positive")
        .int("GOOGLE_RATE_LIMIT_WINDOW_MS must be integer"),

    GOOGLE_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error: "GOOGLE_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("GOOGLE_RATE_LIMIT_MAX must be positive")
        .int("GOOGLE_RATE_LIMIT_MAX must be integer"),
    DEVICE_REGISTER_RATE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "DEVICE_REGISTER_RATE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("DEVICE_REGISTER_RATE_LIMIT_WINDOW_MS must be positive")
        .int("DEVICE_REGISTER_RATE_LIMIT_WINDOW_MS must be integer"),
    DEVICE_REGISTER_RATE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error:
                "DEVICE_REGISTER_RATE_LIMIT_MAX must be a valid number",
        })
        .positive("DEVICE_REGISTER_RATE_LIMIT_MAX must be positive")
        .int("DEVICE_REGISTER_RATE_LIMIT_MAX must be integer"),
    DEVICE_LISTS_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "DEVICE_LISTS_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("DEVICE_LISTS_LIMIT_WINDOW_MS must be positive")
        .int("DEVICE_LISTS_LIMIT_WINDOW_MS must be integer"),
    DEVICE_LISTS_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error: "DEVICE_LISTS_LIMIT_MAX must be a valid number",
        })
        .positive("DEVICE_LISTS_LIMIT_MAX must be positive")
        .int("DEVICE_LISTS_LIMIT_MAX must be integer"),
    DEVICE_REVOKE_LIMIT_WINDOW_MS: z.coerce
        .number({
            invalid_type_error:
                "DEVICE_REVOKE_LIMIT_WINDOW_MS must be a valid number",
        })
        .positive("DEVICE_REVOKE_LIMIT_WINDOW_MS must be positive")
        .int("DEVICE_REVOKE_LIMIT_WINDOW_MS must be integer"),
    DEVICE_REVOKE_LIMIT_MAX: z.coerce
        .number({
            invalid_type_error:
                "DEVICE_REVOKE_LIMIT_MAX must be a valid number",
        })
        .positive("DEVICE_REVOKE_LIMIT_MAX must be positive")
        .int("DEVICE_REVOKE_LIMIT_MAX must be integer"),
});
