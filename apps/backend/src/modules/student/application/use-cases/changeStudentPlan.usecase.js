import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const changeStudentPlanUseCase = ({ studentRepository }) => {
    return async ({ id, planId }) => {
        if (!Number.isInteger(id) || id <= 0) {
            throw new AppError("id inválido.", {
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

        const student = await studentRepository.findById(id);
        if (!student) {
            throw new AppError("Alumno no encontrado.", {
                code: ErrorCode.STUDENT_NOT_FOUND,
                httpStatus: 404,
            });
        }

        if (student.status === "INACTIVE") {
            throw new AppError("No se puede cambiar el plan de un alumno dado de baja.", {
                code: ErrorCode.STUDENT_ALREADY_INACTIVE,
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

        return studentRepository.updatePlan(id, planId);
    };
};

export { changeStudentPlanUseCase };
