import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_TYPES = new Set(["REGULAR", "GUEST"]);

const updateStudentUseCase = ({ studentRepository }) => {
    return async ({
        id,
        email,
        firstName,
        lastName,
        phone,
        type,
        notes,
    }) => {
        if (!Number.isInteger(id) || id <= 0) {
            throw new AppError("id inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        const current = await studentRepository.findById(id);
        if (!current) {
            throw new AppError("Alumno no encontrado.", {
                code: ErrorCode.STUDENT_NOT_FOUND,
                httpStatus: 404,
            });
        }

        if (current.status === "INACTIVE") {
            throw new AppError("No se puede editar un alumno dado de baja.", {
                code: ErrorCode.STUDENT_ALREADY_INACTIVE,
                httpStatus: 409,
            });
        }

        if (type !== undefined && !STUDENT_TYPES.has(type)) {
            throw new AppError("type debe ser REGULAR o GUEST.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        if (email !== undefined) {
            if (!EMAIL_REGEX.test(email)) {
                throw new AppError("Email inválido.", {
                    code: ErrorCode.VALIDATION_ERROR,
                    httpStatus: 400,
                });
            }

            if (email !== current.user?.email) {
                const existing = await studentRepository.findByEmail(email);
                if (existing) {
                    throw new AppError("Ya existe un usuario con ese email.", {
                        code: ErrorCode.EMAIL_ALREADY_EXISTS,
                        httpStatus: 409,
                    });
                }
            }
        }

        const userData = {};
        if (email !== undefined) userData.email = email;
        if (firstName !== undefined) userData.firstName = firstName.trim();
        if (lastName !== undefined) userData.lastName = lastName.trim();
        if (phone !== undefined) userData.phone = phone?.trim() || null;

        const studentData = {};
        if (type !== undefined) studentData.type = type;
        if (notes !== undefined) studentData.notes = notes?.trim() || null;

        const updated = await studentRepository.update(id, {
            user: Object.keys(userData).length > 0 ? userData : undefined,
            student: Object.keys(studentData).length > 0 ? studentData : undefined,
        });

        return updated;
    };
};

export { updateStudentUseCase };
