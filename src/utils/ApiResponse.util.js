class ApiResponse {
    constructor({
        statusCode,
        message = "Success",
        data = null,
        meta = {},
        requestId = null,
    }) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
        this.meta = meta;
        this.requestId = requestId;
        this.timestamp = new Date().toISOString();
    }

    static success({
        data = null,
        message = "Success",
        meta = {},
        requestId = null,
    }) {
        return new ApiResponse({
            statusCode: 200,
            message,
            data,
            meta,
            requestId,
        });
    }

    static created({
        data = null,
        message = "Created successfully",
        meta = {},
        requestId = null,
    }) {
        return new ApiResponse({
            statusCode: 201,
            message,
            data,
            meta,
            requestId,
        });
    }
}

export default ApiResponse;
