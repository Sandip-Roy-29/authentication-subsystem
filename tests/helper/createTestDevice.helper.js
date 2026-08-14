import Device from "#modules/device/models/device.model.js";

export const createTestDevice = async ({ owner, overrides = {} } = {}) => {
    const device = await Device.create({
        owner,
        name: "Test Device",
        platform: "linux-daemon",
        role: "controller",
        capabilities: ["screenshot", "lock_screen", "shell_exec", "notify"],
        apiKey: "raw-test-key-1234567890abcdef",
        ...overrides,
    });

    return device;
};