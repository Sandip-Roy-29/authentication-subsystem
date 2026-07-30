import { requestRegistration } from "./requestRegistration.helper.js";
import { getEmailVerificationOtp } from "./getEmailVerificationOtp.helper.js";

export const createPendingVerification = async (role = "user") => {
    const { agent, user } = await requestRegistration(role);

    const otp = await getEmailVerificationOtp(user.email);

    return {
        agent,
        user,
        otp,
    };
};