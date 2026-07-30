import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import jwt from "jsonwebtoken";

import verifyAccessToken from "#modules/auth/middlewares/verifyAccessToken.middleware.js";
import redisClient from "#infra/redis/redis.client.js";
import { AppError } from "#shared/utils";

describe("verifyAccessToken middleware", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            headers: {},
        };

        res = {};

        next = jest.fn();

        jest.restoreAllMocks();
    });

    test("Should authenticate valid access token", async () => {
        req.headers.authorization = "Bearer valid-token";

        jest.spyOn(jwt, "verify").mockReturnValue({
            sub: "user-id",
            email: "test@example.com",
            role: "user",
            exp: 9999999999,
            jti: "token-jti",
        });

        jest.spyOn(redisClient, "get").mockResolvedValue(null);

        await verifyAccessToken(req, res, next);

        expect(req.user).toEqual({
            _id: "user-id",
            email: "test@example.com",
            role: "user",
            exp: 9999999999,
            jti: "token-jti",
        });

        expect(next).toHaveBeenCalledWith();
    });

    test("Should reject when Authorization header is missing", async () => {
        await verifyAccessToken(req, res, next);

        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Unauthorized request");
    });

    test("Should reject invalid Bearer format", async () => {
        req.headers.authorization = "InvalidToken";

        await verifyAccessToken(req, res, next);

        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Invalid access token format");
    });

    test("Should reject missing token after Bearer", async () => {
        req.headers.authorization = "Bearer ";

        await verifyAccessToken(req, res, next);

        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Access token missing");
    });

    test("Should reject revoked token", async () => {
        req.headers.authorization = "Bearer valid-token";

        jest.spyOn(jwt, "verify").mockReturnValue({
            sub: "user-id",
            email: "test@example.com",
            role: "user",
            exp: 9999999999,
            jti: "token-jti",
        });

        jest.spyOn(redisClient, "get").mockResolvedValue("revoked");

        await verifyAccessToken(req, res, next);

        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Token revoked");
    });

    test("Should convert JsonWebTokenError into AppError", async () => {
        req.headers.authorization = "Bearer invalid-token";

        jest.spyOn(jwt, "verify").mockImplementation(() => {
            const error = new Error("invalid");
            error.name = "JsonWebTokenError";
            throw error;
        });

        await verifyAccessToken(req, res, next);

        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Invalid or expired access token");
    });

    test("Should convert TokenExpiredError into AppError", async () => {
        req.headers.authorization = "Bearer expired-token";

        jest.spyOn(jwt, "verify").mockImplementation(() => {
            const error = new Error("expired");
            error.name = "TokenExpiredError";
            throw error;
        });

        await verifyAccessToken(req, res, next);

        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Invalid or expired access token");
    });

    test("Should pass unexpected errors to next()", async () => {
        req.headers.authorization = "Bearer valid-token";

        const dbError = new Error("Redis connection failed");

        jest.spyOn(jwt, "verify").mockReturnValue({
            sub: "user-id",
            email: "test@example.com",
            role: "user",
            exp: 9999999999,
            jti: "token-jti",
        });

        jest.spyOn(redisClient, "get").mockRejectedValue(dbError);

        await verifyAccessToken(req, res, next);

        expect(next).toHaveBeenCalledWith(dbError);
    });
});