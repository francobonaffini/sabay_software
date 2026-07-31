import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { deactivatePlanUseCase } from "../../src/modules/plan/application/use-cases/deactivatePlan.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildPlan,
    buildPlanRepositoryMock,
} from "../helpers/plan.fixtures.js";

describe("deactivatePlanUseCase", () => {
    it("desactiva un plan activo", async () => {
        const planRepository = buildPlanRepositoryMock({
            findById: mock.fn(async () => buildPlan({ active: true })),
            setActive: mock.fn(async () => buildPlan({ active: false })),
        });
        const deactivate = deactivatePlanUseCase({ planRepository });

        const result = await deactivate({ id: 1 });

        assert.equal(result.active, false);
        assert.deepEqual(planRepository.setActive.mock.calls[0].arguments, [
            1,
            false,
        ]);
    });

    it("lanza PLAN_ALREADY_INACTIVE si ya está inactivo", async () => {
        const deactivate = deactivatePlanUseCase({
            planRepository: buildPlanRepositoryMock({
                findById: mock.fn(async () => buildPlan({ active: false })),
            }),
        });

        await assert.rejects(
            () => deactivate({ id: 1 }),
            (error) =>
                error.code === ErrorCode.PLAN_ALREADY_INACTIVE &&
                error.httpStatus === 409
        );
    });

    it("lanza PLAN_NOT_FOUND si no existe", async () => {
        const deactivate = deactivatePlanUseCase({
            planRepository: buildPlanRepositoryMock({
                findById: mock.fn(async () => null),
            }),
        });

        await assert.rejects(
            () => deactivate({ id: 9 }),
            (error) => error.code === ErrorCode.PLAN_NOT_FOUND
        );
    });
});
