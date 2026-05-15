import mongoose from "mongoose";
import bcrypt from "bcrypt";
import env from "../config/env.config.js";

const { Schema } = mongoose;

const userSchema = new Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength:[2, "Name must be at least 2 character"],
        maxlength:[50, "Name can be exceed 50 character"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase:true,
        index: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength:[8, "Password must be at least 8 character"],
        select: false
    }
},{
    timestamps: true,
    versionKey: false
});


userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;
    
    this.password= await bcrypt.hash(this.password,env.BCRYPT_SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (password){
    const result = await bcrypt.compare(password, this.password);
    return result;
};

export const User = mongoose.model("User", userSchema);