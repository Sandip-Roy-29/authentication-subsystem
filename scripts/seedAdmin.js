import mongoose from "mongoose";
import env from "../config/env.config.js";
import { User } from "../models/user.model.js";

await mongoose.connect(env.MONGODB_URI);

const ADMIN_EMAIL = "admin@gmail.com";

const existingUser = await User.findOne({
    email: ADMIN_EMAIL,
});

if (existingUser) {
    console.log("Admin already exist");
    process.exit();
}

const admin = new User({
    name: "Super Admin",
    email: ADMIN_EMAIL,
    password: "Admin@123",
    role: "admin",
});

await admin.save();

console.log("Admin created successfully");

process.exit();
