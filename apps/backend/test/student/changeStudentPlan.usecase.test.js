import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { changeStudentPlanUseCase } from "../../src/modules/student/application/use-cases/changeStudentPlan.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildPlan,
    buildStudent,
    buildStudentRepositoryMock,
} from "../helpers/student.fixtures.js";

describe("changeStudentPlanUseCase", () => {
    it("cambia el plan cuando el alumno y el plan son válidos", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => buildStudent({ status: "ACTIVE" })),
            findPlanById: mock.fn(async () => buildPlan({ id: 2, active: true })),
            updatePlan: mock.fn(async () =>
                buildStudent({ planId: 2, plan: buildPlan({ id: 2 }) })
            ),
        });
        const changePlan = changeStudentPlanUseCase({ studentRepository });

        const result = await changePlan({ id: 1, planId: 2 });

        assert.equal(result.planId, 2);
        assert.deepEqual(
            studentRepository.updatePlan.mock.calls[0].arguments,
            [1, 2]
        );
    });

    it("lanza PLAN_NOT_FOUND si el plan no existe", async () => {
        const changePlan = changeStudentPlanUseCase({
            studentRepository: buildStudentRepositoryMock({
                findPlanById: mock.fn(async () => null),
            }),
        });

        await assert.rejects(
            () => changePlan({ id: 1, planId: 99 }),
            (error) => error.code === ErrorCode.PLAN_NOT_FOUND
        );
    });

    it("lanza PLAN_INACTIVE si el plan no está activo", async () => {
        const changePlan = changeStudentPlanUseCase({
            studentRepository: buildStudentRepositoryMock({
                findPlanById: mock.fn(async () =>
                    buildPlan({ id: 2, active: false })
                ),
            }),
        });

        await assert.rejects(
            () => changePlan({ id: 1, planId: 2 }),
            (error) => error.code === ErrorCode.PLAN_INACTIVE
        );
    });

    it("lanza STUDENT_ALREADY_INACTIVE si el alumno está dado de baja", async () => {
        const changePlan = changeStudentPlanUseCase({
            studentRepository: buildStudentRepositoryMock({
                findById: mock.fn(async () =>
                    buildStudent({ status: "INACTIVE" })
                ),
            }),
        });

        await assert.rejects(
            () => changePlan({ id: 1, planId: 2 }),
            (error) => error.code === ErrorCode.STUDENT_ALREADY_INACTIVE
        );
    });

    it("lanza VALIDATION_ERROR si planId es inválido", async () => {
        const changePlan = changeStudentPlanUseCase({
            studentRepository: buildStudentRepositoryMock(),
        });

        await assert.rejects(
            () => changePlan({ id: 1, planId: 0 }),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });
});
