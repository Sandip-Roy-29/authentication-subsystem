// Configs
import mongoose from "mongoose";
import env from "#env";
import { beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import redisClient from "#infra/redis/redis.client.js";

// Models
import transporter from "#infra/mail/transporter.js";

jest.setTimeout(60000);

beforeAll(async () => {
    jest.spyOn(transporter, "sendMail").mockResolvedValue({
        messageId: "mock-message-id",
    });
    await mongoose.connect(env.MONGODB_URI, {
        maxPoolSize: env.DB_MAX_POOL_SIZE || 10,
        minPoolSize: env.DB_MIN_POOL_SIZE || 0,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
    });

    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}, 70000);

afterAll(async () => {
    await mongoose.connection.close();

    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}, 70000);

afterEach(async () => {
    for (const collection of Object.values(
        mongoose.connection.collections
    )) {
        await collection.deleteMany({});
    }

    await redisClient.flushDb();
});
