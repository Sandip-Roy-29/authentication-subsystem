import { describe, test, expect, jest } from "@jest/globals";

import env from "#env";
import {
    setAuthCookies,
    clearAuthCookies,
} from "#modules/auth/utils/cookie.util.js";

describe("cookie.util", () => {
    describe("setAuthCookies()", () => {
        test("Should set refresh token cookie", () => {
            const res = {
                cookie: jest.fn(),
            };

            setAuthCookies(res, "refresh-token");

            expect(res.cookie).toHaveBeenCalledTimes(1);

            expect(res.cookie).toHaveBeenCalledWith(
                "refreshToken",
                "refresh-token",
                {
                    httpOnly: true,
                    secure: env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 15 * 60 * 1000,
                }
            );
        });
    });

    describe("clearAuthCookies()", () => {
        test("Should clear refresh token cookie", () => {
            const res = {
                clearCookie: jest.fn(),
            };

            clearAuthCookies(res);

            expect(res.clearCookie).toHaveBeenCalledTimes(1);

            expect(res.clearCookie).toHaveBeenCalledWith(
                "refreshToken",
                {
                    httpOnly: true,
                    secure: env.NODE_ENV === "production",
                    sameSite: "strict",
                }
            );
        });
    });
});