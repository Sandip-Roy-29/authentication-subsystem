class AppError extends Error {
    constructor(message = "Internal server error", statusCode = 500) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.name = this.constructor.name;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
