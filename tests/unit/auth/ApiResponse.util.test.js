import { describe, test, expect } from "@jest/globals";

import ApiResponse from "#shared/utils/ApiResponse.util.js";

describe("ApiResponse", () => {
    describe("constructor", () => {
        test("Should create an ApiResponse instance", () => {
            const response = new ApiResponse({
                statusCode: 202,
                message: "Accepted",
                data: { id: 1 },
                meta: { page: 1 },
                requestId: "req-123",
            });

            expect(response.statusCode).toBe(202);
            expect(response.message).toBe("Accepted");
            expect(response.data).toEqual({ id: 1 });
            expect(response.success).toBe(true);
            expect(response.meta).toEqual({ page: 1 });
            expect(response.requestId).toBe("req-123");
            expect(response.timestamp).toBeDefined();
            expect(new Date(response.timestamp).toString()).not.toBe(
                "Invalid Date"
            );
        });
    });

    describe("success()", () => {
        test("Should create a successful response", () => {
            const response = ApiResponse.success({
                data: { user: "Sandip" },
                message: "Success",
                meta: { total: 1 },
                requestId: "req-456",
            });

            expect(response.statusCode).toBe(200);
            expect(response.success).toBe(true);
            expect(response.message).toBe("Success");
            expect(response.data).toEqual({ user: "Sandip" });
            expect(response.meta).toEqual({ total: 1 });
            expect(response.requestId).toBe("req-456");
            expect(response.timestamp).toBeDefined();
        });

        test("Should use default values", () => {
            const response = ApiResponse.success({});

            expect(response.statusCode).toBe(200);
            expect(response.success).toBe(true);
            expect(response.message).toBe("Success");
            expect(response.data).toBeNull();
            expect(response.meta).toEqual({});
            expect(response.requestId).toBeNull();
        });
    });

    describe("created()", () => {
        test("Should create a created response", () => {
            const response = ApiResponse.created({
                data: { id: 10 },
                message: "User created",
                meta: { version: 1 },
                requestId: "req-789",
            });

            expect(response.statusCode).toBe(201);
            expect(response.success).toBe(true);
            expect(response.message).toBe("User created");
            expect(response.data).toEqual({ id: 10 });
            expect(response.meta).toEqual({ version: 1 });
            expect(response.requestId).toBe("req-789");
            expect(response.timestamp).toBeDefined();
        });

        test("Should use default values", () => {
            const response = ApiResponse.created({});

            expect(response.statusCode).toBe(201);
            expect(response.success).toBe(true);
            expect(response.message).toBe("Created successfully");
            expect(response.data).toBeNull();
            expect(response.meta).toEqual({});
            expect(response.requestId).toBeNull();
        });
    });
});