import { ErrorCode } from "../errors/errorCode.js";

const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: {
            code: ErrorCode.NOT_FOUND,
            message: `Ruta ${req.method} ${req.originalUrl} no encontrada.`,
        },
    });
};

export { notFoundHandler };
