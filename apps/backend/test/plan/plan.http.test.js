import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { buildApp } from "../../src/app.js";
import { buildV1Router } from "../../src/api/v1/v1.router.js";
import { buildAuthModule } from "../../src/modules/auth/interfaces/auth.module.js";
import { buildPlanModule } from "../../src/modules/plan/interfaces/http/plan.module.js";
import { buildStudentModule } from "../../src/modules/student/interfaces/student.module.js";
import { AppError } from "../../src/shared/errors/AppError.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import { buildPlan } from "../helpers/plan.fixtures.js";

const buildTestApp = (planDeps = {}) => {
    const planModule = buildPlanModule(planDeps);
    const authModule = buildAuthModule({
        login: mock.fn(async () => {
            throw new Error("not used");
        }),
    });
    const studentModule = buildStudentModule({
        createStudent: mock.fn(async () => {
            throw new Error("not used");
        }),
    });
    const v1Router = buildV1Router({ authModule, studentModule, planModule });
    return buildApp({ v1Router });
};

describe("Plan HTTP — /api/v1/plans", () => {
    it("POST /plans — 201 crea plan", async () => {
        const plan = buildPlan();
        const createPlan = mock.fn(async () => plan);
        const app = buildTestApp({ createPlan });

        const response = await request(app)
            .post("/api/v1/plans")
            .send({
                name: "Mensual 8",
                classesPerMonth: 8,
                price: 25000,
                active: true,
            })
            .expect(201)
            .expect("Content-Type", /json/);

        assert.deepEqual(createPlan.mock.calls[0].arguments[0], {
            name: "Mensual 8",
            classesPerMonth: 8,
            price: 25000,
            active: true,
        });
        assert.equal(response.body.id, plan.id);
        assert.equal(response.body.name, plan.name);
    });

    it("GET /plans — 200 lista planes", async () => {
        const listPlans = mock.fn(async () => [
            buildPlan({ id: 1 }),
            buildPlan({ id: 2 }),
        ]);
        const app = buildTestApp({ listPlans });

        const response = await request(app)
            .get("/api/v1/plans")
            .query({ active: "true" })
            .expect(200);

        assert.equal(response.body.length, 2);
        assert.deepEqual(listPlans.mock.calls[0].arguments[0], {
            active: true,
        });
    });

    it("GET /plans/:id — 200 / 404", async () => {
        const getPlanById = mock.fn(async ({ id }) => {
            if (id === 1) return buildPlan({ id: 1 });
            throw new AppError("Plan no encontrado.", {
                code: ErrorCode.PLAN_NOT_FOUND,
                httpStatus: 404,
            });
        });
        const app = buildTestApp({ getPlanById });

        const ok = await request(app).get("/api/v1/plans/1").expect(200);
        assert.equal(ok.body.id, 1);

        const missing = await request(app).get("/api/v1/plans/99").expect(404);
        assert.equal(missing.body.error.code, ErrorCode.PLAN_NOT_FOUND);
    });

    it("PATCH /plans/:id — 200 actualiza plan", async () => {
        const updatePlan = mock.fn(async () =>
            buildPlan({ name: "Pro", price: "30000.00" })
        );
        const app = buildTestApp({ updatePlan });

        const response = await request(app)
            .patch("/api/v1/plans/1")
            .send({ name: "Pro", price: 30000 })
            .expect(200);

        assert.equal(response.body.name, "Pro");
        assert.deepEqual(updatePlan.mock.calls[0].arguments[0], {
            id: 1,
            name: "Pro",
            price: 30000,
        });
    });

    it("PATCH /plans/:id/activate — 200 / 409", async () => {
        const activatePlan = mock.fn(async ({ id }) => {
            if (id === 2) {
                throw new AppError("El plan ya está activo.", {
                    code: ErrorCode.PLAN_ALREADY_ACTIVE,
                    httpStatus: 409,
                });
            }
            return buildPlan({ id, active: true });
        });
        const app = buildTestApp({ activatePlan });

        const ok = await request(app)
            .patch("/api/v1/plans/1/activate")
            .expect(200);
        assert.equal(ok.body.active, true);

        const conflict = await request(app)
            .patch("/api/v1/plans/2/activate")
            .expect(409);
        assert.equal(conflict.body.error.code, ErrorCode.PLAN_ALREADY_ACTIVE);
    });

    it("PATCH /plans/:id/deactivate — 200 / 409", async () => {
        const deactivatePlan = mock.fn(async ({ id }) => {
            if (id === 2) {
                throw new AppError("El plan ya está inactivo.", {
                    code: ErrorCode.PLAN_ALREADY_INACTIVE,
                    httpStatus: 409,
                });
            }
            return buildPlan({ id, active: false });
        });
        const app = buildTestApp({ deactivatePlan });

        const ok = await request(app)
            .patch("/api/v1/plans/1/deactivate")
            .expect(200);
        assert.equal(ok.body.active, false);

        const conflict = await request(app)
            .patch("/api/v1/plans/2/deactivate")
            .expect(409);
        assert.equal(
            conflict.body.error.code,
            ErrorCode.PLAN_ALREADY_INACTIVE
        );
    });

    it("POST /plans — 400 validación", async () => {
        const createPlan = mock.fn(async () => {
            throw new AppError("El nombre del plan es obligatorio.", {
                code: ErrorCode.VALIDATION_ERROR,
                httpStatus: 400,
            });
        });
        const app = buildTestApp({ createPlan });

        const response = await request(app)
            .post("/api/v1/plans")
            .send({ classesPerMonth: 8, price: 1000 })
            .expect(400);

        assert.equal(response.body.error.code, ErrorCode.VALIDATION_ERROR);
    });
});
