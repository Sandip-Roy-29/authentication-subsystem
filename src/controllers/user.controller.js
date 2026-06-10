// Services
import { getUsers } from "../services/user.services.js";
import { deleteUser } from "../services/user.services.js";

// Utils
import ApiResponse from "../utils/ApiResponse.util.js";
import AppError from "../utils/AppError.util.js";

export const getUsersController = async (req, res) => {
    const users = await getUsers();

    res.status(200).json(
        ApiResponse.success({
            data: users,
            requestId: req.requestId,
        })
    );
};

export const deleteUserController = async (req, res) => {
    if (req.user._id.toString() === req.params.userId) {
        throw new AppError("You can not delete your own account", 400);
    }

    await deleteUser(req.params.userId);

    res.status(200).json(
        ApiResponse.success({
            message: "User deleted successfully",
            requestId: req.requestId,
        })
    );
};
