import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { buildPlanModule } from "../../src/modules/plan/interfaces/http/plan.module.js";
import { buildPlan } from "../helpers/plan.fixtures.js";

describe("buildPlanModule", () => {
    it("expone basePath /plans y un router funcional", async () => {
        const plan = buildPlan();
        const createPlan = mock.fn(async () => plan);
        const module = buildPlanModule({ createPlan });

        assert.equal(module.basePath, "/plans");

        const app = express();
        app.use(express.json());
        app.use(module.basePath, module.router);

        const response = await request(app)
            .post("/plans")
            .send({
                name: "Mensual 8",
                classesPerMonth: 8,
                price: 25000,
            })
            .expect(201);

        assert.equal(response.body.id, plan.id);
        assert.equal(createPlan.mock.callCount(), 1);
    });
});
