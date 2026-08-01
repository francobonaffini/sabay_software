import { changeTeacherStatusUseCase } from "../../application/use-cases/changeTeacherStatus.usecase.js";
import { createTeacherUseCase } from "../../application/use-cases/createTeacher.usecase.js";
import { getTeacherByIdUseCase } from "../../application/use-cases/getTeacherById.usecase.js";
import { searchTeachersUseCase } from "../../application/use-cases/searchTeachers.usecase.js";
import { updateTeacherUseCase } from "../../application/use-cases/updateTeacher.usecase.js";
import { teacherPrismaRepository } from "../../infrastructure/repository/teacher.prisma.repository.js";
import { buildTeacherController } from "./teacher.controller.js";
import { buildTeacherRouter } from "./teacher.routes.js";

/**
 * @param {{
 *   teacherRepository?: typeof teacherPrismaRepository,
 *   createTeacher?: Function,
 *   getTeacherById?: Function,
 *   searchTeachers?: Function,
 *   updateTeacher?: Function,
 *   changeTeacherStatus?: Function,
 * }} [deps]
 */
const buildTeacherModule = ({
    teacherRepository = teacherPrismaRepository,
    createTeacher,
    getTeacherById,
    searchTeachers,
    updateTeacher,
    changeTeacherStatus,
} = {}) => {
    const deps = { teacherRepository };

    const controller = buildTeacherController({
        createTeacher: createTeacher ?? createTeacherUseCase(deps),
        getTeacherById: getTeacherById ?? getTeacherByIdUseCase(deps),
        searchTeachers: searchTeachers ?? searchTeachersUseCase(deps),
        updateTeacher: updateTeacher ?? updateTeacherUseCase(deps),
        changeTeacherStatus:
            changeTeacherStatus ?? changeTeacherStatusUseCase(deps),
    });

    const router = buildTeacherRouter(controller);

    return {
        basePath: "/teachers",
        router,
    };
};

export { buildTeacherModule };
