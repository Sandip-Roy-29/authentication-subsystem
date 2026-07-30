import { requestRegistration } from "./requestRegistration.helper.js";
import { getEmailVerificationOtp } from "./getEmailVerificationOtp.helper.js";
import { verifyEmail } from "./verifyEmail.helper.js";

export const createAuthenticatedUser = async (role = "user") => {
    const { agent, user } = await requestRegistration(role);

    const otp = await getEmailVerificationOtp(user.email);

    const response = await verifyEmail(agent, user.email, otp);

    return {
        response,
        agent,
        user: {
            ...user,
            id: response.body.data.id,
            role,
        },
        userId: response.body.data.id,
        accessToken: response.body.data.accessToken,
        cookies: response.headers["set-cookie"],
    };
};