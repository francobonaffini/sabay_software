import { AppError } from "../errors/AppError.js";
import { ErrorCode } from "../errors/errorCode.js";

const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.httpStatus).json({
            error: {
                code: err.code,
                message: err.message,
                ...(Object.keys(err.meta).length > 0 ? { meta: err.meta } : {}),
            },
        });
    }

    if (err?.type === "entity.parse.failed") {
        return res.status(400).json({
            error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: "JSON inválido.",
            },
        });
    }

    console.error(err);

    return res.status(500).json({
        error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Error interno del servidor.",
        },
    });
};

export { errorHandler };
