import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { listPlansUseCase } from "../../src/modules/plan/application/use-cases/listPlans.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildPlan,
    buildPlanRepositoryMock,
} from "../helpers/plan.fixtures.js";

describe("listPlansUseCase", () => {
    it("delega el filtro active al repositorio", async () => {
        const plans = [buildPlan({ id: 1 }), buildPlan({ id: 2 })];
        const planRepository = buildPlanRepositoryMock({
            findMany: mock.fn(async () => plans),
        });
        const list = listPlansUseCase({ planRepository });

        const result = await list({ active: true });

        assert.equal(result.length, 2);
        assert.deepEqual(planRepository.findMany.mock.calls[0].arguments[0], {
            active: true,
        });
    });

    it("lista sin filtros", async () => {
        const planRepository = buildPlanRepositoryMock();
        const list = listPlansUseCase({ planRepository });

        await list();

        assert.deepEqual(planRepository.findMany.mock.calls[0].arguments[0], {
            active: undefined,
        });
    });

    it("lanza VALIDATION_ERROR si active no es boolean", async () => {
        const list = listPlansUseCase({
            planRepository: buildPlanRepositoryMock(),
        });

        await assert.rejects(
            () => list({ active: "true" }),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });
});
