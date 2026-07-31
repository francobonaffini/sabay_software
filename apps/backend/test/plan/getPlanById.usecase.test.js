import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { getPlanByIdUseCase } from "../../src/modules/plan/application/use-cases/getPlanById.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildPlan,
    buildPlanRepositoryMock,
} from "../helpers/plan.fixtures.js";

describe("getPlanByIdUseCase", () => {
    it("retorna el plan cuando existe", async () => {
        const plan = buildPlan({ id: 7 });
        const planRepository = buildPlanRepositoryMock({
            findById: mock.fn(async () => plan),
        });
        const getById = getPlanByIdUseCase({ planRepository });

        const result = await getById({ id: 7 });

        assert.equal(result.id, 7);
        assert.equal(planRepository.findById.mock.callCount(), 1);
    });

    it("lanza VALIDATION_ERROR si id es inválido", async () => {
        const getById = getPlanByIdUseCase({
            planRepository: buildPlanRepositoryMock(),
        });

        await assert.rejects(
            () => getById({ id: -1 }),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });

    it("lanza PLAN_NOT_FOUND si no existe", async () => {
        const getById = getPlanByIdUseCase({
            planRepository: buildPlanRepositoryMock({
                findById: mock.fn(async () => null),
            }),
        });

        await assert.rejects(
            () => getById({ id: 99 }),
            (error) =>
                error.code === ErrorCode.PLAN_NOT_FOUND &&
                error.httpStatus === 404
        );
    });
});
