export const CAPABILITY_PRESETS = {
    "windows-daemon": ["screenshot", "lock_screen", "shell_exec", "notify"],
    "linux-daemon": ["screenshot", "lock_screen", "shell_exec", "notify"],
    "macos-daemon": ["screenshot", "lock_screen", "shell_exec", "notify"],
    "browser": ["vibrate", "notify", "location"],
    "esp32-sensor": ["read_reading"],
};

export const ENDPOINT_PLATFORMS = new Set(["esp32-sensor"]);