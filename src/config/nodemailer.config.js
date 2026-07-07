import nodemailer from "nodemailer";
import env from "./env.config.js";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth:{
        user: env.SMTP_HOST,
        pass: env.SMTP_PASSWORD,
    }
});

export default transporter;