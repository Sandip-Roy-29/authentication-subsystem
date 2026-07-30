import { User } from "#modules/user/models/user.model.js";

export const createUser = async () => {
    const user = new User({
        name: "Test",
        email: `test${Date.now()}@gmail.com`,
        password: "Test@123",
        provider: "local",
        role: "user",
        isEmailVerified: true,
    });

    await user.save();

    return user;
};