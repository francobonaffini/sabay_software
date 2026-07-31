import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { activatePlanUseCase } from "../../src/modules/plan/application/use-cases/activatePlan.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildPlan,
    buildPlanRepositoryMock,
} from "../helpers/plan.fixtures.js";

describe("activatePlanUseCase", () => {
    it("activa un plan inactivo", async () => {
        const planRepository = buildPlanRepositoryMock({
            findById: mock.fn(async () => buildPlan({ active: false })),
            setActive: mock.fn(async () => buildPlan({ active: true })),
        });
        const activate = activatePlanUseCase({ planRepository });

        const result = await activate({ id: 1 });

        assert.equal(result.active, true);
        assert.deepEqual(planRepository.setActive.mock.calls[0].arguments, [
            1,
            true,
        ]);
    });

    it("lanza PLAN_ALREADY_ACTIVE si ya está activo", async () => {
        const activate = activatePlanUseCase({
            planRepository: buildPlanRepositoryMock({
                findById: mock.fn(async () => buildPlan({ active: true })),
            }),
        });

        await assert.rejects(
            () => activate({ id: 1 }),
            (error) =>
                error.code === ErrorCode.PLAN_ALREADY_ACTIVE &&
                error.httpStatus === 409
        );
    });

    it("lanza PLAN_NOT_FOUND si no existe", async () => {
        const activate = activatePlanUseCase({
            planRepository: buildPlanRepositoryMock({
                findById: mock.fn(async () => null),
            }),
        });

        await assert.rejects(
            () => activate({ id: 9 }),
            (error) => error.code === ErrorCode.PLAN_NOT_FOUND
        );
    });
});
