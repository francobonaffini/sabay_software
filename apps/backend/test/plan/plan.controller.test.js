import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { buildPlanController } from "../../src/modules/plan/interfaces/http/plan.controller.js";
import { AppError } from "../../src/shared/errors/AppError.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import { buildPlan } from "../helpers/plan.fixtures.js";

const createMockRes = () => {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
    return res;
};

const buildController = (overrides = {}) =>
    buildPlanController({
        createPlan: mock.fn(),
        getPlanById: mock.fn(),
        listPlans: mock.fn(),
        updatePlan: mock.fn(),
        activatePlan: mock.fn(),
        deactivatePlan: mock.fn(),
        ...overrides,
    });

describe("buildPlanController", () => {
    it("create responde 201 con el DTO", async () => {
        const plan = buildPlan();
        const createPlan = mock.fn(async () => plan);
        const controller = buildController({ createPlan });
        const res = createMockRes();
        const next = mock.fn();

        await controller.create(
            {
                body: {
                    name: "Mensual 8",
                    classesPerMonth: "8",
                    price: "25000",
                    active: true,
                },
            },
            res,
            next
        );

        assert.equal(res.statusCode, 201);
        assert.equal(res.body.id, plan.id);
        assert.deepEqual(createPlan.mock.calls[0].arguments[0], {
            name: "Mensual 8",
            classesPerMonth: 8,
            price: 25000,
            active: true,
        });
        assert.equal(next.mock.callCount(), 0);
    });

    it("getById / list / update / activate / deactivate responden 200", async () => {
        const plan = buildPlan({ active: false });
        const getPlanById = mock.fn(async () => plan);
        const listPlans = mock.fn(async () => [plan]);
        const updatePlan = mock.fn(async () => plan);
        const activatePlan = mock.fn(async () => buildPlan({ active: true }));
        const deactivatePlan = mock.fn(async () =>
            buildPlan({ active: false })
        );
        const controller = buildController({
            getPlanById,
            listPlans,
            updatePlan,
            activatePlan,
            deactivatePlan,
        });
        const next = mock.fn();

        const getRes = createMockRes();
        await controller.getById({ params: { id: "4" } }, getRes, next);
        assert.equal(getRes.statusCode, 200);
        assert.deepEqual(getPlanById.mock.calls[0].arguments[0], { id: 4 });

        const listRes = createMockRes();
        await controller.list({ query: { active: "true" } }, listRes, next);
        assert.equal(listRes.statusCode, 200);
        assert.deepEqual(listPlans.mock.calls[0].arguments[0], {
            active: true,
        });

        const updateRes = createMockRes();
        await controller.update(
            { params: { id: "1" }, body: { name: "Pro" } },
            updateRes,
            next
        );
        assert.equal(updateRes.statusCode, 200);

        const activateRes = createMockRes();
        await controller.activate({ params: { id: "1" } }, activateRes, next);
        assert.equal(activateRes.body.active, true);

        const deactivateRes = createMockRes();
        await controller.deactivate(
            { params: { id: "1" } },
            deactivateRes,
            next
        );
        assert.equal(deactivateRes.body.active, false);
        assert.equal(next.mock.callCount(), 0);
    });

    it("delega errores a next", async () => {
        const error = new AppError("Plan no encontrado.", {
            code: ErrorCode.PLAN_NOT_FOUND,
            httpStatus: 404,
        });
        const controller = buildController({
            getPlanById: mock.fn(async () => {
                throw error;
            }),
        });
        const res = createMockRes();
        const next = mock.fn();

        await controller.getById({ params: { id: "1" } }, res, next);

        assert.equal(next.mock.calls[0].arguments[0], error);
        assert.equal(res.statusCode, null);
    });
});
