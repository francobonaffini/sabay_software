import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const activatePlanUseCase = ({ planRepository }) => {
    return async ({ id }) => {
        if (!Number.isInteger(id) || id <= 0) {
            throw new AppError("id inválido.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        const plan = await planRepository.findById(id);
        if (!plan) {
            throw new AppError("Plan no encontrado.", {
                code: ErrorCode.PLAN_NOT_FOUND,
                httpStatus: 404,
            });
        }

        if (plan.active) {
            throw new AppError("El plan ya está activo.", {
                code: ErrorCode.PLAN_ALREADY_ACTIVE,
                httpStatus: 409,
            });
        }

        return planRepository.setActive(id, true);
    };
};

export { activatePlanUseCase };
