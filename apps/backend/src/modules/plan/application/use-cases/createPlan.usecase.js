import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const createPlanUseCase = ({ planRepository }) => {
    return async ({ name, classesPerMonth, price, active }) => {
        if (!name?.trim()) {
            throw new AppError("El nombre del plan es obligatorio.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        if (!Number.isInteger(classesPerMonth) || classesPerMonth <= 0) {
            throw new AppError("classesPerMonth debe ser un entero positivo.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        const parsedPrice = Number(price);
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            throw new AppError("price inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        if (active !== undefined && typeof active !== "boolean") {
            throw new AppError("active debe ser boolean.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        return planRepository.create({
            name: name.trim(),
            classesPerMonth,
            price: parsedPrice,
            active: active ?? true,
        });
    };
};

export { createPlanUseCase };
