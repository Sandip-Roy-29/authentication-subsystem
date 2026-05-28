import request from "supertest";
import app from "../../src/app.js";

export const loginUser = async (payload) => {
   return await request(app)
      .post("/api/v1/auth/login")
      .send(payload);
};