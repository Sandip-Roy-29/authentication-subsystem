export const createUserPayload = (role) => ({
    name: "Test",
    email: `test${Date.now()}@gmail.com`,
    password: "Test@123",
    role,
});
