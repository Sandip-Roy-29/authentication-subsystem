import redisClient from "#infra/redis/redis.client.js";
import { createUser } from "./createUser.helper";

export const createPasswordReset = async (existingUser = null) => {
    const user = existingUser ?? (await createUser());

    const otp = "123456";

    await redisClient.set(
        `password-reset:${user.email}`,
        JSON.stringify({
            userId: user._id,
            otp,
        }),
        {
            EX: 600,
        }
    );

    await redisClient.set(
        `password-reset-cooldown:${user.email}`,
        "1",
        {
            EX: 60,
        }
    );

    return { user, otp };
};