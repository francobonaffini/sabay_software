import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const deactivateStudentUseCase = ({ studentRepository }) => {
    return async ({ id }) => {
        if (!Number.isInteger(id) || id <= 0) {
            throw new AppError("id inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        const student = await studentRepository.findById(id);
        if (!student) {
            throw new AppError("Alumno no encontrado.", {
                code: ErrorCode.STUDENT_NOT_FOUND,
                httpStatus: 404,
            });
        }

        if (student.status === "INACTIVE") {
            throw new AppError("El alumno ya está dado de baja.", {
                code: ErrorCode.STUDENT_ALREADY_INACTIVE,
                httpStatus: 409,
            });
        }

        return studentRepository.updateStatus(id, "INACTIVE");
    };
};

export { deactivateStudentUseCase };
