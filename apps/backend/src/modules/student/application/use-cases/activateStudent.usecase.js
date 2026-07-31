import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

/**
 * Reactiva un alumno suspendido (SUSPENDED → ACTIVE).
 * No permite reactivar alumnos dados de baja (INACTIVE).
 */
const activateStudentUseCase = ({ studentRepository }) => {
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
            throw new AppError(
                "No se puede activar un alumno dado de baja.",
                {
                    code: ErrorCode.STUDENT_ALREADY_INACTIVE,
                    httpStatus: 409,
                }
            );
        }

        if (student.status === "ACTIVE") {
            throw new AppError("El alumno ya está activo.", {
                code: ErrorCode.STUDENT_ALREADY_ACTIVE,
                httpStatus: 409,
            });
        }

        return studentRepository.updateStatus(id, "ACTIVE");
    };
};

export { activateStudentUseCase };
