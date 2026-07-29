class AppError extends Error {
    /**
     * @param {string} message
     * @param {{ code: string, httpStatus?: number, cause?: unknown, meta?: Record<string, unknown> }} options
     */
    constructor(message, { code, httpStatus = 500, cause, meta = {} }) {
        super(message);
        this.name = "AppError";
        this.code = code;
        this.httpStatus = httpStatus;
        this.cause = cause;
        this.meta = meta;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export { AppError };
