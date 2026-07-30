import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { describe, test, expect, beforeEach } from "@jest/globals";

import env from "#env";
import { User } from "#modules/user/models/user.model.js";

describe("User Model", () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe("Password hashing", () => {
        test("Should hash password before save", async () => {
            const user = new User({
                name: "Test User",
                email: "test1@gmail.com",
                password: "Test@123",
            });

            await user.save();

            expect(user.password).not.toBe("Test@123");
            expect(
                await bcrypt.compare("Test@123", user.password)
            ).toBe(true);
        });

        test("Should not hash password again if unchanged", async () => {
            const user = new User({
                name: "Test User",
                email: "test2@gmail.com",
                password: "Test@123",
            });

            await user.save();

            const firstHash = user.password;

            await user.save();

            expect(user.password).toBe(firstHash);
        });

        test("Should allow google user without password", async () => {
            const user = new User({
                name: "Google User",
                email: "google@gmail.com",
                provider: "google",
                googleId: "google-123",
            });

            await expect(user.save()).resolves.not.toThrow();
        });
    });

    describe("Refresh token hashing", () => {
        test("Should hash refresh token JTI before save", async () => {
            const user = new User({
                name: "Test User",
                email: "test3@gmail.com",
                password: "Test@123",
            });

            const token = jwt.sign(
                {
                    sub: "123",
                    email: user.email,
                    jti: "refresh-token-id",
                },
                env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            user.refreshToken = {
                token,
                expiresAt: new Date(Date.now() + 1000 * 60),
            };

            await user.save();

            expect(user.refreshToken.token).not.toBe(token);

            expect(
                await bcrypt.compare(
                    "refresh-token-id",
                    user.refreshToken.token
                )
            ).toBe(true);
        });

        test("Should throw when refresh token has no JTI", async () => {
            const user = new User({
                name: "Test User",
                email: "test4@gmail.com",
                password: "Test@123",
            });

            const token = jwt.sign(
                {
                    sub: "123",
                    email: user.email,
                },
                env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            user.refreshToken = {
                token,
                expiresAt: new Date(Date.now() + 1000 * 60),
            };

            await expect(user.save()).rejects.toThrow(
                "Refresh token JTI missing"
            );
        });
    });

    describe("comparePassword()", () => {
        test("Should return true for correct password", async () => {
            const user = new User({
                name: "Test User",
                email: "test5@gmail.com",
                password: "Test@123",
            });

            await user.save();

            expect(
                await user.comparePassword("Test@123")
            ).toBe(true);
        });

        test("Should return false for incorrect password", async () => {
            const user = new User({
                name: "Test User",
                email: "test6@gmail.com",
                password: "Test@123",
            });

            await user.save();

            expect(
                await user.comparePassword("WrongPassword")
            ).toBe(false);
        });

        test("Should return false when password is missing", async () => {
            const user = new User({
                name: "Google User",
                email: "google2@gmail.com",
                provider: "google",
                googleId: "google-456",
            });

            expect(
                await user.comparePassword("Test@123")
            ).toBe(false);
        });
    });

    describe("compareRefreshToken()", () => {
        test("Should return true for valid refresh token", async () => {
            const user = new User({
                name: "Test User",
                email: "test7@gmail.com",
                password: "Test@123",
            });

            const token = jwt.sign(
                {
                    sub: "123",
                    email: user.email,
                    jti: "refresh-token-123",
                },
                env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            user.refreshToken = {
                token,
                expiresAt: new Date(Date.now() + 1000 * 60),
            };

            await user.save();

            expect(
                await user.compareRefreshToken(token)
            ).toBe(true);
        });

        test("Should return false when refresh token is missing", async () => {
            const user = new User({
                name: "Test User",
                email: "test8@gmail.com",
                password: "Test@123",
            });

            await user.save();

            expect(
                await user.compareRefreshToken("anything")
            ).toBe(false);
        });

        test("Should return false for invalid refresh token", async () => {
            const user = new User({
                name: "Test User",
                email: "test9@gmail.com",
                password: "Test@123",
            });

            const validToken = jwt.sign(
                {
                    sub: "123",
                    email: user.email,
                    jti: "correct-jti",
                },
                env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            user.refreshToken = {
                token: validToken,
                expiresAt: new Date(Date.now() + 1000 * 60),
            };

            await user.save();

            const invalidToken = jwt.sign(
                {
                    sub: "123",
                    email: user.email,
                    jti: "wrong-jti",
                },
                env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            expect(
                await user.compareRefreshToken(invalidToken)
            ).toBe(false);
        });

        test("Should return false when token has no JTI", async () => {
            const user = new User({
                name: "Test User",
                email: "test10@gmail.com",
                password: "Test@123",
            });

            const validToken = jwt.sign(
                {
                    sub: "123",
                    email: user.email,
                    jti: "correct-jti",
                },
                env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            user.refreshToken = {
                token: validToken,
                expiresAt: new Date(Date.now() + 1000 * 60),
            };

            await user.save();

            const invalidToken = jwt.sign(
                {
                    sub: "123",
                    email: user.email,
                },
                env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            expect(
                await user.compareRefreshToken(invalidToken)
            ).toBe(false);
        });
    });
});