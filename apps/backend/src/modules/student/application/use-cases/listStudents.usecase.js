import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const STUDENT_STATUSES = new Set(["ACTIVE", "SUSPENDED", "INACTIVE"]);
const STUDENT_TYPES = new Set(["REGULAR", "GUEST"]);

const listStudentsUseCase = ({ studentRepository }) => {
    return async ({ status, type, search } = {}) => {
        if (status && !STUDENT_STATUSES.has(status)) {
            throw new AppError("status inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        if (type && !STUDENT_TYPES.has(type)) {
            throw new AppError("type inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        return studentRepository.findMany({
            status,
            type,
            search: search?.trim() || undefined,
        });
    };
};

export { listStudentsUseCase };
