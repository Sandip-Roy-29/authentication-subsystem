import { ZodError } from "zod";
import { AppError } from "../utils/index.js";

const validateMiddleware = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return next(
                    new AppError(
                        error.issues[0]?.message || "Validation failed",
                        400
                    )
                );
            }
            next(error);
        }
    };
};

export default validateMiddleware;
