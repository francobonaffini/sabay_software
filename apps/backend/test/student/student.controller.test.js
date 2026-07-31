import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { buildStudentController } from "../../src/modules/student/interfaces/student.controller.js";
import { AppError } from "../../src/shared/errors/AppError.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import { buildStudent } from "../helpers/student.fixtures.js";

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

describe("buildStudentController", () => {
    it("create responde 201 con el DTO", async () => {
        const student = buildStudent();
        const createStudent = mock.fn(async () => student);
        const controller = buildStudentController({
            createStudent,
            getStudentById: mock.fn(),
            listStudents: mock.fn(),
            updateStudent: mock.fn(),
            changeStudentPlan: mock.fn(),
            suspendStudent: mock.fn(),
            activateStudent: mock.fn(),
            deactivateStudent: mock.fn(),
        });
        const res = createMockRes();
        const next = mock.fn();

        await controller.create(
            {
                body: {
                    email: "  Alumno@Pilates.TEST ",
                    firstName: "Lucía",
                    lastName: "Pérez",
                    planId: "1",
                    type: "REGULAR",
                },
            },
            res,
            next
        );

        assert.equal(res.statusCode, 201);
        assert.equal(res.body.id, student.id);
        assert.equal(res.body.user.email, student.user.email);
        assert.deepEqual(createStudent.mock.calls[0].arguments[0], {
            email: "alumno@pilates.test",
            firstName: "Lucía",
            lastName: "Pérez",
            phone: undefined,
            planId: 1,
            type: "REGULAR",
            notes: undefined,
        });
        assert.equal(next.mock.callCount(), 0);
    });

    it("getById responde 200", async () => {
        const student = buildStudent({ id: 4 });
        const getStudentById = mock.fn(async () => student);
        const controller = buildStudentController({
            createStudent: mock.fn(),
            getStudentById,
            listStudents: mock.fn(),
            updateStudent: mock.fn(),
            changeStudentPlan: mock.fn(),
            suspendStudent: mock.fn(),
            activateStudent: mock.fn(),
            deactivateStudent: mock.fn(),
        });
        const res = createMockRes();

        await controller.getById({ params: { id: "4" } }, res, mock.fn());

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.id, 4);
        assert.deepEqual(getStudentById.mock.calls[0].arguments[0], { id: 4 });
    });

    it("list responde 200 con array", async () => {
        const listStudents = mock.fn(async () => [buildStudent()]);
        const controller = buildStudentController({
            createStudent: mock.fn(),
            getStudentById: mock.fn(),
            listStudents,
            updateStudent: mock.fn(),
            changeStudentPlan: mock.fn(),
            suspendStudent: mock.fn(),
            activateStudent: mock.fn(),
            deactivateStudent: mock.fn(),
        });
        const res = createMockRes();

        await controller.list(
            { query: { status: "ACTIVE", search: "luc" } },
            res,
            mock.fn()
        );

        assert.equal(res.statusCode, 200);
        assert.equal(Array.isArray(res.body), true);
        assert.deepEqual(listStudents.mock.calls[0].arguments[0], {
            status: "ACTIVE",
            type: undefined,
            search: "luc",
        });
    });

    it("update / changePlan / suspend / activate / deactivate responden 200", async () => {
        const student = buildStudent({ status: "SUSPENDED" });
        const updateStudent = mock.fn(async () => student);
        const changeStudentPlan = mock.fn(async () => student);
        const suspendStudent = mock.fn(async () => student);
        const activateStudent = mock.fn(async () =>
            buildStudent({ status: "ACTIVE" })
        );
        const deactivateStudent = mock.fn(async () => student);
        const controller = buildStudentController({
            createStudent: mock.fn(),
            getStudentById: mock.fn(),
            listStudents: mock.fn(),
            updateStudent,
            changeStudentPlan,
            suspendStudent,
            activateStudent,
            deactivateStudent,
        });
        const next = mock.fn();

        const updateRes = createMockRes();
        await controller.update(
            { params: { id: "1" }, body: { type: "GUEST" } },
            updateRes,
            next
        );
        assert.equal(updateRes.statusCode, 200);

        const planRes = createMockRes();
        await controller.changePlan(
            { params: { id: "1" }, body: { planId: "2" } },
            planRes,
            next
        );
        assert.deepEqual(changeStudentPlan.mock.calls[0].arguments[0], {
            id: 1,
            planId: 2,
        });

        const suspendRes = createMockRes();
        await controller.suspend({ params: { id: "1" } }, suspendRes, next);
        assert.equal(suspendRes.statusCode, 200);

        const activateRes = createMockRes();
        await controller.activate({ params: { id: "1" } }, activateRes, next);
        assert.equal(activateRes.statusCode, 200);
        assert.equal(activateRes.body.status, "ACTIVE");

        const deactivateRes = createMockRes();
        await controller.deactivate(
            { params: { id: "1" } },
            deactivateRes,
            next
        );
        assert.equal(deactivateRes.statusCode, 200);
        assert.equal(next.mock.callCount(), 0);
    });

    it("delega errores a next", async () => {
        const error = new AppError("Alumno no encontrado.", {
            code: ErrorCode.STUDENT_NOT_FOUND,
            httpStatus: 404,
        });
        const controller = buildStudentController({
            createStudent: mock.fn(),
            getStudentById: mock.fn(async () => {
                throw error;
            }),
            listStudents: mock.fn(),
            updateStudent: mock.fn(),
            changeStudentPlan: mock.fn(),
            suspendStudent: mock.fn(),
            activateStudent: mock.fn(),
            deactivateStudent: mock.fn(),
        });
        const res = createMockRes();
        const next = mock.fn();

        await controller.getById({ params: { id: "1" } }, res, next);

        assert.equal(next.mock.calls[0].arguments[0], error);
        assert.equal(res.statusCode, null);
    });
});
