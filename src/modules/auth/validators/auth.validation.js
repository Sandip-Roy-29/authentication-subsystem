import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: "Name is required",
            })
            .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
            .min(3, "Name must be atleast 3 character")
            .max(50, "Name cannot exceed 50 character"),

        email: z
            .string({
                required_error: "Email is required",
            })
            .trim()
            .email("Invalid email")
            .toLowerCase(),

        password: z
            .string({
                required_error: "Password is required",
            })
            .min(8, "Password must be at least 8 character")
            .max(128, "Password cannot exceed 120 character")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/,
                "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character"
            ),
    }),
});

export const registrationVerificationSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: "Email is required",
            })
            .trim()
            .email("Invalid email")
            .toLowerCase(),

        otp: z
            .number({
                required_error: "OTP is required",
            })
            .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),
});

export const resendVerificationSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: "Email is required",
            })
            .trim()
            .email("Invalid email")
            .toLowerCase(),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: "Email is required",
            })
            .trim()
            .email("Invalid email")
            .toLowerCase(),
        otp: z
            .string({
                required_error: "Otp is required",
            })
            .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
        password: z
            .string({
                required_error: "Password is required",
            })
            .min(8, "Password must be at least 8 character")
            .max(128, "Password cannot exceed 120 character")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/,
                "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character"
            ),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: "Email is required",
            })
            .trim()
            .email("Invalid email")
            .toLowerCase(),

        password: z
            .string({
                required_error: "Password is required",
            })
            .min(8, "Password must be at least 8 character")
            .max(128, "Password cannot exceed 120 character")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/,
                "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character"
            ),
    }),
});

export const googleLoginSchema = z.object({
    body: z.object({
        idToken: z.string({
            required_error: "Google ID token is required",
        }),
    }),
});
