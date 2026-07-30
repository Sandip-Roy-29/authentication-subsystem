import redisClient from "#infra/redis/redis.client.js";

export const getEmailVerificationOtp = async (email) => {
    const data = await redisClient.get(`email-verification:${email}`);

    if (!data) {
        throw new Error(`OTP not found for ${email}`);
    }

    const parsed = JSON.parse(data);

    return parsed.otp;
};