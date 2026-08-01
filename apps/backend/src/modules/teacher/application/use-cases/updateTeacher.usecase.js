import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const updateTeacherUseCase = ({ teacherRepository }) => {
    return async ({
        id,
        email,
        firstName,
        lastName,
        phone,
        color,
    }) => {
        if (!Number.isInteger(id) || id <= 0) {
            throw new AppError("id inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        const current = await teacherRepository.findById(id);
        if (!current) {
            throw new AppError("Profesor no encontrado.", {
                code: ErrorCode.TEACHER_NOT_FOUND,
                httpStatus: 404,
            });
        }

        if (current.status === "INACTIVE") {
            throw new AppError("No se puede editar un profesor inactivo.", {
                code: ErrorCode.TEACHER_ALREADY_INACTIVE,
                httpStatus: 409,
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
                const existing = await teacherRepository.findByEmail(email);
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

        const teacherData = {};
        if (color !== undefined) teacherData.color = color?.trim() || null;

        return teacherRepository.update(id, {
            user: Object.keys(userData).length > 0 ? userData : undefined,
            teacher: Object.keys(teacherData).length > 0 ? teacherData : undefined,
        });
    };
};

export { updateTeacherUseCase };
