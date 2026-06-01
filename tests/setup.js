import mongoose from "mongoose";
import env from "../src/config/env.config.js";
import { beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import { User } from "../src/models/user.model.js";
import redisClient from "../src/config/redis.config.js";

jest.setTimeout(60000);

beforeAll(async () => {
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
    await User.deleteMany({});
});
