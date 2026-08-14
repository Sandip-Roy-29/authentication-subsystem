import ApiResponse from "#shared/utils/ApiResponse.util.js";
import { listDevices, registerDevice, revokeDevice } from "../services/device.service.js";

export const registerDeviceController = async (req, res) => {
    const { name, platform } = req.body;
    const userId = req.user._id;

    const data = await registerDevice({ name, platform, userId });

    return res.status(201).json(
        ApiResponse.success({
            data,
            message: "Device registered successfully",
            requestId: req.requestId,
        })
    );
};

export const listDevicesController = async (req, res) => {
    const userId = req.user._id;

    const devices = await listDevices({userId });

    return res.status(200).json(
        ApiResponse.success({
            data: devices,
            message: "Devices fetched successfully",
            requestId: req.requestId,
        })
    );
};

export const revokeDeviceController = async (req, res) => {
    const userId = req.user._id;
    const {deviceId} = req.params;

    await revokeDevice({userId, deviceId });

    return res.status(200).json(
        ApiResponse.success({
            message: "Device revoked successfully",
            requestId: req.requestId,
        })
    );
};
