import { describe, test, expect, jest, beforeEach } from "@jest/globals";

import env from "#env";
import errorMiddleware from "#shared/middlewares/error.middleware.js";
import { AppError, logger } from "#shared/utils";

describe("error.middleware", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            requestId: "req-123",
            method: "POST",
            originalUrl: "/api/v1/auth/login",
            ip: "127.0.0.1",
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();

        jest.spyOn(logger, "error").mockImplementation(() => {});
    });

    test("Should handle AppError", () => {
        const error = new AppError("Invalid credentials", 401);

        errorMiddleware(error, req, res, next);

        expect(logger.error).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Invalid credentials",
                statusCode: 401,
                requestId: "req-123",
                error: {
                    type: "AppError",
                },
            })
        );
    });

    test("Should return generic message for unexpected errors", () => {
        const error = new Error("Database crashed");

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Internal server error",
                statusCode: 500,
                error: {
                    type: "Error",
                },
            })
        );
    });

    test("Should include timestamp", () => {
        const error = new AppError("Bad request", 400);

        errorMiddleware(error, req, res, next);

        const response = res.json.mock.calls[0][0];

        expect(response.timeStamp).toBeDefined();
        expect(new Date(response.timeStamp).toString()).not.toBe(
            "Invalid Date"
        );
    });

    test("Should include stack trace in development", () => {
        if (env.NODE_ENV !== "development") {
            return;
        }

        const error = new Error("Boom");

        errorMiddleware(error, req, res, next);

        const response = res.json.mock.calls[0][0];

        expect(response.stack).toBe(error.stack);
    });

    test("Should omit stack trace outside development", () => {
        if (env.NODE_ENV === "development") {
            return;
        }

        const error = new Error("Boom");

        errorMiddleware(error, req, res, next);

        const response = res.json.mock.calls[0][0];

        expect(response.stack).toBeUndefined();
    });
});