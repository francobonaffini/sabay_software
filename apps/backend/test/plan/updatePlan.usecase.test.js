import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { updatePlanUseCase } from "../../src/modules/plan/application/use-cases/updatePlan.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildPlan,
    buildPlanRepositoryMock,
} from "../helpers/plan.fixtures.js";

describe("updatePlanUseCase", () => {
    it("actualiza campos enviados", async () => {
        const planRepository = buildPlanRepositoryMock({
            findById: mock.fn(async () => buildPlan({ id: 3 })),
            update: mock.fn(async () =>
                buildPlan({ id: 3, name: "Pro", price: "30000.00" })
            ),
        });
        const updatePlan = updatePlanUseCase({ planRepository });

        const result = await updatePlan({
            id: 3,
            name: "  Pro ",
            price: "30000",
        });

        assert.equal(result.name, "Pro");
        assert.deepEqual(planRepository.update.mock.calls[0].arguments, [
            3,
            { name: "Pro", price: 30000 },
        ]);
    });

    it("retorna el plan actual si no hay campos para actualizar", async () => {
        const current = buildPlan({ id: 1 });
        const planRepository = buildPlanRepositoryMock({
            findById: mock.fn(async () => current),
        });
        const updatePlan = updatePlanUseCase({ planRepository });

        const result = await updatePlan({ id: 1 });

        assert.equal(result, current);
        assert.equal(planRepository.update.mock.callCount(), 0);
    });

    it("lanza PLAN_NOT_FOUND si no existe", async () => {
        const updatePlan = updatePlanUseCase({
            planRepository: buildPlanRepositoryMock({
                findById: mock.fn(async () => null),
            }),
        });

        await assert.rejects(
            () => updatePlan({ id: 99, name: "X" }),
            (error) =>
                error.code === ErrorCode.PLAN_NOT_FOUND &&
                error.httpStatus === 404
        );
    });

    it("lanza VALIDATION_ERROR si name queda vacío", async () => {
        const updatePlan = updatePlanUseCase({
            planRepository: buildPlanRepositoryMock(),
        });

        await assert.rejects(
            () => updatePlan({ id: 1, name: "   " }),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });

    it("lanza VALIDATION_ERROR si id es inválido", async () => {
        const updatePlan = updatePlanUseCase({
            planRepository: buildPlanRepositoryMock(),
        });

        await assert.rejects(
            () => updatePlan({ id: 0, name: "X" }),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });
});
