import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env.config.js";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email",
            ],
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            lowercase: true,
            required: true,
        },

        password: {
            type: String,
            required: function () {
                return this.provider == "local";
            },
            select: false,
        },

        refreshToken: {
            token: {
                type: String,
                select: false,
            },

            expiresAt: {
                type: Date,
            },
        },

        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    if (!this.password) return;

    this.password = await bcrypt.hash(
        this.password,
        Number(env.BCRYPT_SALT_ROUNDS)
    );
});

userSchema.pre("save", async function () {
    if (!this.isModified("refreshToken")) return;

    if (!this.refreshToken?.token) return;

    const decodedToken = jwt.decode(this.refreshToken.token);

    if (!decodedToken?.jti) {
        throw new Error("Refresh token JTI missing");
    }

    this.refreshToken.token = await bcrypt.hash(
        decodedToken.jti,
        Number(env.BCRYPT_SALT_ROUNDS)
    );
});

userSchema.methods.comparePassword = async function (incomingPassword) {
    if (!this.password) return false;

    return bcrypt.compare(incomingPassword, this.password);
};

userSchema.methods.compareRefreshToken = async function (incomingToken) {
    if (!this.refreshToken?.token) {
        return false;
    }

    const decodedIncomingToken = jwt.decode(incomingToken);

    if (!decodedIncomingToken?.jti) {
        return false;
    }

    return await bcrypt.compare(
        decodedIncomingToken.jti,
        this.refreshToken.token
    );
};

export const User = mongoose.model("User", userSchema);
