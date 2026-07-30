import { changeStudentPlanUseCase } from "../application/use-cases/changeStudentPlan.usecase.js";
import { createStudentUseCase } from "../application/use-cases/createStudent.usecase.js";
import { deactivateStudentUseCase } from "../application/use-cases/deactivateStudent.usecase.js";
import { getStudentByIdUseCase } from "../application/use-cases/getStudentById.usecase.js";
import { listStudentsUseCase } from "../application/use-cases/listStudents.usecase.js";
import { suspendStudentUseCase } from "../application/use-cases/suspendStudent.usecase.js";
import { updateStudentUseCase } from "../application/use-cases/updateStudent.usecase.js";
import { studentPrismaRepository } from "../infrastructure/repositories/student.prisma.repository.js";
import { buildStudentController } from "./student.controller.js";
import { buildStudentRouter } from "./student.routes.js";

/**
 * @param {{
 *   studentRepository?: typeof studentPrismaRepository,
 *   createStudent?: Function,
 *   getStudentById?: Function,
 *   listStudents?: Function,
 *   updateStudent?: Function,
 *   changeStudentPlan?: Function,
 *   suspendStudent?: Function,
 *   deactivateStudent?: Function,
 * }} [deps]
 */
const buildStudentModule = ({
    studentRepository = studentPrismaRepository,
    createStudent,
    getStudentById,
    listStudents,
    updateStudent,
    changeStudentPlan,
    suspendStudent,
    deactivateStudent,
} = {}) => {
    const deps = { studentRepository };

    const controller = buildStudentController({
        createStudent: createStudent ?? createStudentUseCase(deps),
        getStudentById: getStudentById ?? getStudentByIdUseCase(deps),
        listStudents: listStudents ?? listStudentsUseCase(deps),
        updateStudent: updateStudent ?? updateStudentUseCase(deps),
        changeStudentPlan: changeStudentPlan ?? changeStudentPlanUseCase(deps),
        suspendStudent: suspendStudent ?? suspendStudentUseCase(deps),
        deactivateStudent: deactivateStudent ?? deactivateStudentUseCase(deps),
    });

    const router = buildStudentRouter(controller);

    return {
        basePath: "/students",
        router,
    };
};

export { buildStudentModule };
