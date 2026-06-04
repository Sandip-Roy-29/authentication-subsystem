import request from "supertest";
import app from "../../src/app.js";

export const registerUser = async (payload) => {
    return await request(app).post("/api/v1/auth/register").send(payload);
};
