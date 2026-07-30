import request from "supertest";
import app from "../../src/app.js";
import { createUserPayload } from "./createUserPayload.helper.js";

export const requestRegistration = async (role = "user") => {
    const agent = request.agent(app);

    const user = createUserPayload(role);

    const response = await agent
        .post(role === "admin" ? "/api/v1/auth/admin/register" : "/api/v1/auth/register")
        .send(user);

    if (response.statusCode !== 200) {
        throw new Error(
            `Registration request failed: ${response.statusCode} ${JSON.stringify(response.body)}`
        );
    }

    return {
        agent,
        user,
    };
};