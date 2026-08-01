import express from "express";
import { buildAuthModule } from "../../modules/auth/interfaces/auth.module.js";
import { buildPlanModule } from "../../modules/plan/interfaces/http/plan.module.js";
import { buildStudentModule } from "../../modules/student/interfaces/student.module.js";
import { buildTeacherModule } from "../../modules/teacher/interfaces/http/teacher.module.js";

/**
 * Registra todos los módulos de la API v1.
 * Cada módulo es responsable de su propio basePath y router.
 * @param {{
 *   authModule?: { basePath: string, router: import("express").Router },
 *   studentModule?: { basePath: string, router: import("express").Router },
 *   planModule?: { basePath: string, router: import("express").Router },
 *   teacherModule?: { basePath: string, router: import("express").Router },
 * }} [deps]
 * @returns {import("express").Router}
 */
const buildV1Router = ({
    authModule = buildAuthModule(),
    studentModule = buildStudentModule(),
    planModule = buildPlanModule(),
    teacherModule = buildTeacherModule(),
} = {}) => {
    const router = express.Router();

    const modules = [authModule, studentModule, planModule, teacherModule];

    modules.forEach(({ basePath, router: moduleRouter }) => {
        router.use(basePath, moduleRouter);
    });

    return router;
};

export { buildV1Router };
