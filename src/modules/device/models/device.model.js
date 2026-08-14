import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import env from "#env";

const deviceSchema = new mongoose.Schema(
    {
        deviceId: {
            type: String,
            required: true,
            unique: true,
            default: () => crypto.randomUUID(),
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        platform: {
            type: String,
            enum: [
                "windows-daemon",
                "linux-daemon",
                "macos-daemon",
                "browser",
                "esp32-sensor",
            ],
            required: true,
        },
        role: {
            type: String,
            enum: ["controller", "endpoint"],
            required: true,
        },
        capabilities: {
            type: [String],
            default: [],
        },
        apiKey: {
            type: String,
            required: true,
            select: false,
        },
        lastSeenAt: {
            type: Date,
            default: null,
        },
        revoked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

deviceSchema.index({ owner: 1, revoked: 1, createdAt: -1 });

deviceSchema.pre("save", async function () {
    if (!this.isModified("apiKey")) return;
    if (!this.apiKey) return;

    this.apiKey = await bcrypt.hash(
        this.apiKey,
        Number(env.BCRYPT_SALT_ROUNDS)
    );
});

deviceSchema.methods.compareApiKey = async function (incomingApiKey) {
    if (!this.apiKey) return false;

    return bcrypt.compare(incomingApiKey, this.apiKey);
};

export default mongoose.model("Device", deviceSchema);