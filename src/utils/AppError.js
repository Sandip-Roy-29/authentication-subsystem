class AppError extends Error {
    constructor(statusCode = 500, message) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
