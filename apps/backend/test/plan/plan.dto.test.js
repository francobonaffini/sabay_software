import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    mapCreatePlanRequest,
    mapListPlansQuery,
    mapPlanIdParam,
    mapUpdatePlanRequest,
    toPlanListResponseDTO,
    toPlanResponseDTO,
} from "../../src/modules/plan/interfaces/http/plan.dto.js";
import { buildPlan } from "../helpers/plan.fixtures.js";

describe("plan.dto", () => {
    describe("mapCreatePlanRequest", () => {
        it("convierte classesPerMonth y price a number", () => {
            assert.deepEqual(
                mapCreatePlanRequest({
                    name: "Mensual 8",
                    classesPerMonth: "8",
                    price: "25000.50",
                    active: true,
                }),
                {
                    name: "Mensual 8",
                    classesPerMonth: 8,
                    price: 25000.5,
                    active: true,
                }
            );
        });

        it("tolera body vacío", () => {
            assert.deepEqual(mapCreatePlanRequest(), {
                name: undefined,
                classesPerMonth: undefined,
                price: undefined,
                active: undefined,
            });
        });
    });

    describe("mapUpdatePlanRequest", () => {
        it("solo incluye campos presentes", () => {
            assert.deepEqual(
                mapUpdatePlanRequest({ name: "Pro", price: "30000" }),
                { name: "Pro", price: 30000 }
            );
        });
    });

    describe("mapListPlansQuery / mapPlanIdParam", () => {
        it("parsea active string y id de params", () => {
            assert.deepEqual(mapListPlansQuery({ active: "true" }), {
                active: true,
            });
            assert.deepEqual(mapListPlansQuery({ active: "false" }), {
                active: false,
            });
            assert.deepEqual(mapListPlansQuery({}), {});
            assert.deepEqual(mapPlanIdParam({ id: "12" }), { id: 12 });
        });
    });

    describe("toPlanResponseDTO", () => {
        it("serializa price Decimal con toString", () => {
            const dto = toPlanResponseDTO(
                buildPlan({
                    price: { toString: () => "25000.00" },
                })
            );

            assert.deepEqual(dto, {
                id: 1,
                name: "Mensual 8",
                classesPerMonth: 8,
                price: "25000.00",
                active: true,
            });
        });

        it("mapea listas", () => {
            const list = toPlanListResponseDTO([
                buildPlan({ id: 1 }),
                buildPlan({ id: 2 }),
            ]);
            assert.equal(list.length, 2);
            assert.equal(list[1].id, 2);
        });
    });
});
