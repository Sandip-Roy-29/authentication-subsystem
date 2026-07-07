import transporter from "../config/nodemailer.config.js";
import env from "../config/env.config.js";

export const sendOtpEmail = async ({email, otp}) => {
    await transporter.sendMail({
        from: env.SMTP_EMAIL,
        to: email,
        subject: "Verify your email",
        html: `
            <h2>Email Verification</h2>
            <p>Your verification code is:</p>
            <h1>${otp}</h1>
            <p>This code expires in 10 minutes.</p>
        `,
    });
};