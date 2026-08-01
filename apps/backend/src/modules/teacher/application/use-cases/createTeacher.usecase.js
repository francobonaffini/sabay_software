import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createTeacherUseCase = ({ teacherRepository }) => {
    return async ({
        email,
        firstName,
        lastName,
        phone,
        color,
    }) => {
        if (!email || !EMAIL_REGEX.test(email)) {
            throw new AppError("Email inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        if (!firstName?.trim() || !lastName?.trim()) {
            throw new AppError("Nombre y apellido son obligatorios.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        const existingUser = await teacherRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError("Ya existe un usuario con ese email.", {
                code: ErrorCode.EMAIL_ALREADY_EXISTS,
                httpStatus: 409,
            });
        }

        return teacherRepository.createWithUser({
            email,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone?.trim() || null,
            color: color?.trim() || null,
        });
    };
};

export { createTeacherUseCase };
