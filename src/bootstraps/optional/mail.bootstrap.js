import transporter from "#infra/mail/transporter.js";

export default async function bootstrapMail() {
        await transporter.verify();
}