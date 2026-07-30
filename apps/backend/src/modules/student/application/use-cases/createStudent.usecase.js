import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_TYPES = new Set(["REGULAR", "GUEST"]);

const createStudentUseCase = ({ studentRepository }) => {
    return async ({
        email,
        firstName,
        lastName,
        phone,
        planId,
        type,
        notes,
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

        if (!Number.isInteger(planId) || planId <= 0) {
            throw new AppError("planId inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        if (!STUDENT_TYPES.has(type)) {
            throw new AppError("type debe ser REGULAR o GUEST.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        const existingUser = await studentRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError("Ya existe un usuario con ese email.", {
                code: ErrorCode.EMAIL_ALREADY_EXISTS,
                httpStatus: 409,
            });
        }

        const plan = await studentRepository.findPlanById(planId);
        if (!plan) {
            throw new AppError("Plan no encontrado.", {
                code: ErrorCode.PLAN_NOT_FOUND,
                httpStatus: 404,
            });
        }

        if (!plan.active) {
            throw new AppError("El plan no está activo.", {
                code: ErrorCode.PLAN_INACTIVE,
                httpStatus: 400,
            });
        }

        return studentRepository.createWithUser({
            email,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone?.trim() || null,
            planId,
            type,
            notes: notes?.trim() || null,
        });
    };
};

export { createStudentUseCase };
