import { describe, test, expect } from "@jest/globals";
import jwt from "jsonwebtoken";

import env from "#env";
import {
    generateAccessToken,
    generateRefreshToken,
} from "#modules/auth/utils/generateTokens.util.js";

describe("generateTokens.util", () => {
    const user = {
        _id: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        role: "user",
    };

    describe("generateAccessToken()", () => {
        test("should generate a valid access token", () => {
            const token = generateAccessToken(user);

            expect(typeof token).toBe("string");

            const payload = jwt.verify(
                token,
                env.ACCESS_TOKEN_SECRET
            );

            expect(payload.sub).toBe(user._id.toString());
            expect(payload.email).toBe(user.email);
            expect(payload.role).toBe(user.role);
            expect(payload.jti).toBeDefined();
            expect(payload.iat).toBeDefined();
            expect(payload.exp).toBeDefined();
        });

        test("should generate a unique token each time", () => {
            const token1 = generateAccessToken(user);
            const token2 = generateAccessToken(user);

            expect(token1).not.toBe(token2);

            const payload1 = jwt.verify(
                token1,
                env.ACCESS_TOKEN_SECRET
            );

            const payload2 = jwt.verify(
                token2,
                env.ACCESS_TOKEN_SECRET
            );

            expect(payload1.jti).not.toBe(payload2.jti);
        });
    });

    describe("generateRefreshToken()", () => {
        test("should generate a valid refresh token", () => {
            const token = generateRefreshToken(user);

            expect(typeof token).toBe("string");

            const payload = jwt.verify(
                token,
                env.REFRESH_TOKEN_SECRET
            );

            expect(payload.sub).toBe(user._id.toString());
            expect(payload.email).toBe(user.email);
            expect(payload.jti).toBeDefined();
            expect(payload.iat).toBeDefined();
            expect(payload.exp).toBeDefined();
        });

        test("should generate a unique refresh token each time", () => {
            const token1 = generateRefreshToken(user);
            const token2 = generateRefreshToken(user);

            expect(token1).not.toBe(token2);

            const payload1 = jwt.verify(
                token1,
                env.REFRESH_TOKEN_SECRET
            );

            const payload2 = jwt.verify(
                token2,
                env.REFRESH_TOKEN_SECRET
            );

            expect(payload1.jti).not.toBe(payload2.jti);
        });

        test("should not be verifiable using the access token secret", () => {
            const token = generateRefreshToken(user);

            expect(() =>
                jwt.verify(token, env.ACCESS_TOKEN_SECRET)
            ).toThrow();
        });
    });
});