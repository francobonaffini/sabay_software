import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    mapChangePlanRequest,
    mapCreateStudentRequest,
    mapListStudentsQuery,
    mapStudentIdParam,
    mapUpdateStudentRequest,
    toStudentListResponseDTO,
    toStudentResponseDTO,
} from "../../src/modules/student/interfaces/student.dto.js";
import { buildStudent } from "../helpers/student.fixtures.js";

describe("student.dto", () => {
    describe("mapCreateStudentRequest", () => {
        it("normaliza email y convierte planId a number", () => {
            assert.deepEqual(
                mapCreateStudentRequest({
                    email: "  Alumno@Pilates.TEST ",
                    firstName: "Lucía",
                    lastName: "Pérez",
                    phone: "111",
                    planId: "2",
                    type: "GUEST",
                    notes: "nota",
                }),
                {
                    email: "alumno@pilates.test",
                    firstName: "Lucía",
                    lastName: "Pérez",
                    phone: "111",
                    planId: 2,
                    type: "GUEST",
                    notes: "nota",
                }
            );
        });

        it("tolera body vacío", () => {
            assert.deepEqual(mapCreateStudentRequest(), {
                email: undefined,
                firstName: undefined,
                lastName: undefined,
                phone: undefined,
                planId: undefined,
                type: undefined,
                notes: undefined,
            });
        });
    });

    describe("mapUpdateStudentRequest", () => {
        it("solo incluye campos presentes y normaliza email", () => {
            assert.deepEqual(
                mapUpdateStudentRequest({
                    email: "  Nueva@Mail.COM ",
                    type: "GUEST",
                }),
                {
                    email: "nueva@mail.com",
                    type: "GUEST",
                }
            );
        });

        it("permite notes null", () => {
            assert.deepEqual(mapUpdateStudentRequest({ notes: null }), {
                notes: null,
            });
        });

        it("ignora planId (el cambio de plan va por /:id/plan)", () => {
            assert.deepEqual(
                mapUpdateStudentRequest({
                    firstName: "Ana",
                    planId: 99,
                }),
                {
                    firstName: "Ana",
                }
            );
        });
    });

    describe("mapChangePlanRequest / mapListStudentsQuery / mapStudentIdParam", () => {
        it("mapea planId, query e id de params", () => {
            assert.deepEqual(mapChangePlanRequest({ planId: "5" }), { planId: 5 });
            assert.deepEqual(
                mapListStudentsQuery({
                    status: "ACTIVE",
                    type: "REGULAR",
                    search: "luc",
                }),
                { status: "ACTIVE", type: "REGULAR", search: "luc" }
            );
            assert.deepEqual(mapStudentIdParam({ id: "12" }), { id: 12 });
        });
    });

    describe("toStudentResponseDTO", () => {
        it("expone student + user + plan con avatarUrl y sin passwordHash", () => {
            const student = buildStudent({
                plan: {
                    id: 1,
                    name: "Mensual 8",
                    classesPerMonth: 8,
                    price: { toString: () => "25000.00" },
                    active: true,
                },
            });

            const dto = toStudentResponseDTO(student);

            assert.equal(dto.id, student.id);
            assert.equal(dto.plan.price, "25000.00");
            assert.deepEqual(dto.user, {
                id: student.user.id,
                email: student.user.email,
                firstName: student.user.firstName,
                lastName: student.user.lastName,
                phone: student.user.phone,
                role: student.user.role,
                status: student.user.status,
                avatarUrl: student.user.avatarUrl,
            });
            assert.equal(dto.user.avatarUrl, "/media/avatars/default.webp");
            assert.equal("passwordHash" in dto.user, false);
        });

        it("mapea listas", () => {
            const list = toStudentListResponseDTO([buildStudent({ id: 1 }), buildStudent({ id: 2 })]);
            assert.equal(list.length, 2);
            assert.equal(list[1].id, 2);
        });
    });
});
