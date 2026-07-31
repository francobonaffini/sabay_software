import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const listPlansUseCase = ({ planRepository }) => {
    return async ({ active } = {}) => {
        if (active !== undefined && typeof active !== "boolean") {
            throw new AppError("active debe ser boolean.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        }

        return planRepository.findMany({ active });
    };
};

export { listPlansUseCase };
