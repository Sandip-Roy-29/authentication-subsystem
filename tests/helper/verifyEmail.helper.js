export const verifyEmail = async (agent, email, otp) => {
    const response = await agent
        .post("/api/v1/auth/verify-email")
        .send({
            email,
            otp,
        });

    if (response.statusCode !== 201) {
        throw new Error(
            `Email verification failed: ${response.statusCode} ${JSON.stringify(response.body)}`
        );
    }

    return response;
};