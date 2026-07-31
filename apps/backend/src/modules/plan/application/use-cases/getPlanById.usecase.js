import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const getPlanByIdUseCase = ({ planRepository }) => {
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

        return plan;
    };
};

export { getPlanByIdUseCase };
