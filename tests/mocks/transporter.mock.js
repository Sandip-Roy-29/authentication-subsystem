import { jest } from "@jest/globals";

export const sendMailMock = jest.fn().mockResolvedValue({
    messageId: "mock-message-id",
});

jest.unstable_mockModule("#infra/mail/transporter.js", () => ({
    default: {
        sendMail: sendMailMock,
    },
}));