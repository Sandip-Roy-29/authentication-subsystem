import request from "supertest";
import app from "../../src/app.js";

export const loginUser = async ({ email, password }) => {
    const agent = request.agent(app);

    const response = await agent.post("/api/v1/auth/login").send({
        email,
        password,
    });

    if (response.statusCode !== 200) {
        throw new Error(
            `Login failed: ${response.statusCode} ${JSON.stringify(response.body)}`
        );
    }

    return {
        response,
        agent,
        accessToken: response.body.data.accessToken,
        cookies: response.headers["set-cookie"],
        userId: response.body.data.id,
    };
};