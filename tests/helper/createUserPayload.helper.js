export const createUserPayload = (role = "user") => ({
    name: "Test",
    email: `test${Date.now()}@gmail.com`,
    password: "Test@123",
    role,
    provider: "local",
    isEmailVerified: false
});
