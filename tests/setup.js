import mongoose from "mongoose";
import env from "../src/config/env.config";
import { beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import { User } from "../src/models/user.model.js";

// Increase default timeout for DB hooks
jest.setTimeout(30000);

beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});

afterEach(async () => {
    await User.deleteMany({});
});
