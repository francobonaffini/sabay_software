import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const TEACHER_STATUSES = new Set(["ACTIVE", "INACTIVE"]);

const changeTeacherStatusUseCase = ({ teacherRepository }) => {
    return async ({ id, teacherStatus }) => {
        if (!Number.isInteger(id) || id <= 0) {
            throw new AppError("id inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        if (!TEACHER_STATUSES.has(teacherStatus)) {
            throw new AppError("teacherStatus debe ser ACTIVE o INACTIVE.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        const teacher = await teacherRepository.findById(id);
        if (!teacher) {
            throw new AppError("Profesor no encontrado.", {
                code: ErrorCode.TEACHER_NOT_FOUND,
                httpStatus: 404,
            });
        }

        if (teacher.status === teacherStatus) {
            throw new AppError(
                teacherStatus === "ACTIVE"
                    ? "El profesor ya está activo."
                    : "El profesor ya está inactivo.",
                {
                    code:
                        teacherStatus === "ACTIVE"
                            ? ErrorCode.TEACHER_ALREADY_ACTIVE
                            : ErrorCode.TEACHER_ALREADY_INACTIVE,
                    httpStatus: 409,
                }
            );
        }

        return teacherRepository.updateStatus(id, teacherStatus);
    };
};

export { changeTeacherStatusUseCase };
