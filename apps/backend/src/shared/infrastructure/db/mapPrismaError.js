import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js'
import { AppError } from "../../errors/AppError.js"
import { ERROR_CODES } from "../../errors/errorCode.js"

const mapPrismaError = (error) => {

    if (!(error instanceof PrismaClientKnownRequestError)) {
        return new AppError('Database error', {
            code: ERROR_CODES.INTERNAL_ERROR,
            httpStatus: 500,
            cause: error,
        })
    }

    if (error.code === 'P2002') {
        return new AppError('Unique constraint failed', {
            code: ERROR_CODES.DB_UNIQUE_CONSTRAINT,
            httpStatus: 409,
            meta: {
                fields: error.meta?.target ?? [],
            },
            cause: error,
        })
    }

    if (error.code === 'P2025') {
        return new AppError('Record not found', {
            code: ERROR_CODES.DB_RECORD_NOT_FOUND,
            httpStatus: 404,
            cause: error,
        })
    }

    return new AppError('Database error', {
        code: ERROR_CODES.INTERNAL_ERROR,
        httpStatus: 500,
        cause: error,
    })
}

export { mapPrismaError }