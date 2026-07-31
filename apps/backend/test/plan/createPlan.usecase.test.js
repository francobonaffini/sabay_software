import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPlanUseCase } from "../../src/modules/plan/application/use-cases/createPlan.usecase.js";
import { AppError } from "../../src/shared/errors/AppError.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildCreatePlanInput,
    buildPlanRepositoryMock,
} from "../helpers/plan.fixtures.js";

describe("createPlanUseCase", () => {
    it("crea un plan con datos válidos y active por defecto true", async () => {
        const planRepository = buildPlanRepositoryMock();
        const createPlan = createPlanUseCase({ planRepository });

        const result = await createPlan({
            name: "  Mensual 8  ",
            classesPerMonth: 8,
            price: "25000",
        });

        assert.deepEqual(planRepository.create.mock.calls[0].arguments[0], {
            name: "Mensual 8",
            classesPerMonth: 8,
            price: 25000,
            active: true,
        });
        assert.equal(result.name, "Mensual 8");
    });

    it("respeta active=false al crear", async () => {
        const planRepository = buildPlanRepositoryMock();
        const createPlan = createPlanUseCase({ planRepository });

        await createPlan(buildCreatePlanInput({ active: false }));

        assert.equal(
            planRepository.create.mock.calls[0].arguments[0].active,
            false
        );
    });

    it("lanza VALIDATION_ERROR si falta el nombre", async () => {
        const createPlan = createPlanUseCase({
            planRepository: buildPlanRepositoryMock(),
        });

        await assert.rejects(
            () => createPlan(buildCreatePlanInput({ name: "  " })),
            (error) =>
                error instanceof AppError &&
                error.code === ErrorCode.VALIDATION_ERROR &&
                error.httpStatus === 400
        );
    });

    it("lanza VALIDATION_ERROR si classesPerMonth no es entero positivo", async () => {
        const createPlan = createPlanUseCase({
            planRepository: buildPlanRepositoryMock(),
        });

        await assert.rejects(
            () => createPlan(buildCreatePlanInput({ classesPerMonth: 0 })),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });

    it("lanza VALIDATION_ERROR si price es inválido", async () => {
        const createPlan = createPlanUseCase({
            planRepository: buildPlanRepositoryMock(),
        });

        await assert.rejects(
            () => createPlan(buildCreatePlanInput({ price: -10 })),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });

    it("lanza VALIDATION_ERROR si active no es boolean", async () => {
        const createPlan = createPlanUseCase({
            planRepository: buildPlanRepositoryMock(),
        });

        await assert.rejects(
            () => createPlan(buildCreatePlanInput({ active: "yes" })),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });
});
