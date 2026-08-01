import { User } from "#modules/user/models/user.model.js";
import { loginUser } from "./loginUser.helper.js";

export const createAuthenticatedAdmin = async () => {
    const admin = new User({
        name: "Admin",
        email: `admin${Date.now()}@gmail.com`,
        password: "Admin@123",
        role: "admin",
        provider: "local",
        isEmailVerified: true,
    });

    await admin.save();

    return loginUser({
        email: admin.email,
        password: "Admin@123",
    });
};