import request from "supertest";
import app from "../../src/app.js";
import { createUserPayload } from "./createUserPayload.helper.js";

export const createAuthenticatedUser = async (role) => {
    const agent = request.agent(app);

    const user = createUserPayload(role);

    const response = await agent.post("/api/v1/auth/register").send(user);

    if (response.statusCode !== 201) {
        throw new Error(
            `Failed to create authenticated user: ${response.statusCode} ${JSON.stringify(response.body)}`
        );
    }

    return {
        userId: response.body.data.id,
        user,
        accessToken: response.body.data.accessToken,
        cookies: response.headers["set-cookie"],
        agent,
    };
};
