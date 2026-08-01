import { generateOtp, AppError } from "#shared/utils/index.js";
import redisClient from "#infra/redis/redis.client.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.util.js";
import { User } from "#modules/user/models/user.model.js";

export const sendVerificationEmail = async ({
    name,
    email,
    password,
    role,
}) => {
    
    const existingUser = await User.exists({ email });

    if (existingUser) {
        throw new AppError("User already exists", 409);
    }

    const pending = await redisClient.exists(`email-verification:${email}`);

    if (pending) {
        throw new AppError(
            "Email verification already pending. Please verify your email.",
            409
        );
    }
    
    const otp = generateOtp();    

    await redisClient.set(
        `email-verification:${email}`,
        JSON.stringify({
            name,
            email,
            password,
            otp,
            role,
        }),
        {
            EX: 600,
        }
    );

    await redisClient.set(`email-verification-cooldown:${email}`, "1", {
        EX: 60,
    });

    await sendOtpEmail({ email, otp });
};

export const verifyEmailOtp = async ({ email, otp }) => {
    const pendingUser = await redisClient.get(`email-verification:${email}`);

    if (!pendingUser) {
        throw new AppError("Verification code expired", 400);
    }

    const data = JSON.parse(pendingUser);

    if (data.otp != otp) {
        throw new AppError("Invalid verification code", 400);
    }

    return data;
};

export const resendVerificationEmail = async (email) => {
    const cooldown = await redisClient.get(
        `email-verification-cooldown:${email}`
    );

    if (cooldown) {
        throw new AppError("Please wait before requesting another OTP.", 429);
    }
    const pendingUser = await redisClient.get(`email-verification:${email}`);

    if (!pendingUser) {
        throw new AppError("Verification code expired", 400);
    }

    const data = JSON.parse(pendingUser);

    const newOtp = generateOtp();

    data.otp = newOtp;

    await redisClient.set(`email-verification:${email}`, JSON.stringify(data), {
        EX: 600,
    });

    await redisClient.set(`email-verification-cooldown:${email}`, "1", {
        EX: 60,
    });

    await sendOtpEmail({ email, newOtp });
};
