import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const TEACHER_STATUSES = new Set(["ACTIVE", "INACTIVE"]);

const searchTeachersUseCase = ({ teacherRepository }) => {
    return async ({ teacherStatus, search } = {}) => {
        if (teacherStatus && !TEACHER_STATUSES.has(teacherStatus)) {
            throw new AppError("teacherStatus debe ser ACTIVE o INACTIVE.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        return teacherRepository.search({
            status: teacherStatus,
            search: search?.trim() || undefined,
        });
    };
};

export { searchTeachersUseCase };
