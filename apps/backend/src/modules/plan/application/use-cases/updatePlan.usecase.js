import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const updatePlanUseCase = ({ planRepository }) => {
    return async ({ id, name, classesPerMonth, price }) => {
        if (!Number.isInteger(id) || id <= 0) {
            throw new AppError("id inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        const current = await planRepository.findById(id);
        if (!current) {
            throw new AppError("Plan no encontrado.", {
                code: ErrorCode.PLAN_NOT_FOUND,
                httpStatus: 404,
            });
        }

        const data = {};

        if (name !== undefined) {
            if (!name?.trim()) {
                throw new AppError("El nombre del plan es obligatorio.", {
                    code: ErrorCode.VALIDATION_ERROR,
                    httpStatus: 400,
                });
            }
            data.name = name.trim();
        }

        if (classesPerMonth !== undefined) {
            if (!Number.isInteger(classesPerMonth) || classesPerMonth <= 0) {
                throw new AppError("classesPerMonth debe ser un entero positivo.", {
                    code: ErrorCode.VALIDATION_ERROR,
                    httpStatus: 400,
                });
            }
            data.classesPerMonth = classesPerMonth;
        }

        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                throw new AppError("price inválido.", {
                    code: ErrorCode.VALIDATION_ERROR,
                    httpStatus: 400,
                });
            }
            data.price = parsedPrice;
        }

        if (Object.keys(data).length === 0) {
            return current;
        }

        return planRepository.update(id, data);
    };
};

export { updatePlanUseCase };
