import {
    getUsers,
    updateUserRole,
    deleteUser,
} from "../services/user.service.js";
import { ApiResponse, AppError } from "#shared/utils";

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

export const updateRoleController = async (req, res) => {
    const { role } = req.body;

    if (req.user._id.toString() === req.params.userId) {
        throw new AppError("You can not change your own role", 400);
    }

    const user = await updateUserRole(req.params.userId, role);

    res.status(200).json(
        ApiResponse.success({
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            message: "User updated successfully",
            requestId: req.requestId,
        })
    );
};
