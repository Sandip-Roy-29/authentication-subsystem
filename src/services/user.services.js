import { User } from "../models/user.model.js";
import AppError from "../utils/AppError.util.js";

export const getUsers = async () => {
    return await User.find().select("-refreshToken.expiresAt");
};

export const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }
};

export const updateUserRole = async (userId, role) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (user.role === role) {
  throw new AppError(
    `User is already ${role}`,
    400
  );
}

    user.role = role;

    await user.save();

    return user;
};
