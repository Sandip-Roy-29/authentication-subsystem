import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: "Name is required",
            })
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
