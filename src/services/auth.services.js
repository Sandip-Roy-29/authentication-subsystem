import { User } from "../models/user.model.js";
import AppError from "../utils/AppError.js";

export const registerUser = async ({name, email, password}) => {
    const existingUser = await User.findOne({ email });

    if(existingUser) {
        throw new AppError("User already exist", 409);
    }

    const user = await User.create(
        {
            name: name,
            email: email,
            password: password
        }
    );

    return user;
};

export const loginUser = async ({email, password}) => {
    const user = await User.findOne({ email }).select("+password");

    if(!user) {
        throw new AppError("User does not exist", 404);
    }

    const isPasswordCorrect = user.comparePassword(password);

    if(!isPasswordCorrect){
        throw new AppError("Invalid credentials", 401);
    }

    return user;
};