import mongoose from "mongoose";
import env from "../src/config/env.config";
import { beforeAll, afterAll, afterEach } from "@jest/globals";
import { User } from "../src/models/user.model.js";

beforeAll(async () => {
    mongoose.connect(env.MONGODB_URI);
});

afterAll(async () => {
    mongoose.connection.close();
});

afterEach(async () => {
    await User.deleteMany({});
});
