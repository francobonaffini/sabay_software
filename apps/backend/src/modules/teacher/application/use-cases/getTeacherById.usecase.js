import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const getTeacherByIdUseCase = ({ teacherRepository }) => {
    return async ({ id }) => {
        if (!Number.isInteger(id) || id <= 0) {
            throw new AppError("id inválido.", {
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

        return teacher;
    };
};

export { getTeacherByIdUseCase };
