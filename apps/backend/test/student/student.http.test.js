import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { buildApp } from "../../src/app.js";
import { buildV1Router } from "../../src/api/v1/v1.router.js";
import { buildAuthModule } from "../../src/modules/auth/interfaces/auth.module.js";
import { buildStudentModule } from "../../src/modules/student/interfaces/student.module.js";
import { AppError } from "../../src/shared/errors/AppError.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import { buildStudent } from "../helpers/student.fixtures.js";

const buildTestApp = (studentDeps = {}) => {
    const studentModule = buildStudentModule(studentDeps);
    const authModule = buildAuthModule({
        login: mock.fn(async () => {
            throw new Error("not used");
        }),
    });
    const v1Router = buildV1Router({ authModule, studentModule });
    return buildApp({ v1Router });
};

describe("Student HTTP — /api/v1/students", () => {
    it("POST /students — 201 crea alumno", async () => {
        const student = buildStudent();
        const createStudent = mock.fn(async () => student);
        const app = buildTestApp({ createStudent });

        const response = await request(app)
            .post("/api/v1/students")
            .send({
                email: "  Alumno@Pilates.TEST ",
                firstName: "Lucía",
                lastName: "Pérez",
                phone: "111222333",
                planId: 1,
                type: "REGULAR",
                notes: "Primera semana",
            })
            .expect(201)
            .expect("Content-Type", /json/);

        assert.deepEqual(createStudent.mock.calls[0].arguments[0], {
            email: "alumno@pilates.test",
            firstName: "Lucía",
            lastName: "Pérez",
            phone: "111222333",
            planId: 1,
            type: "REGULAR",
            notes: "Primera semana",
        });
        assert.equal(response.body.id, student.id);
        assert.equal(response.body.user.email, student.user.email);
        assert.equal("passwordHash" in (response.body.user ?? {}), false);
    });

    it("GET /students — 200 lista alumnos", async () => {
        const listStudents = mock.fn(async () => [
            buildStudent({ id: 1 }),
            buildStudent({ id: 2 }),
        ]);
        const app = buildTestApp({ listStudents });

        const response = await request(app)
            .get("/api/v1/students")
            .query({ status: "ACTIVE", type: "REGULAR", search: "luc" })
            .expect(200);

        assert.equal(response.body.length, 2);
        assert.deepEqual(listStudents.mock.calls[0].arguments[0], {
            status: "ACTIVE",
            type: "REGULAR",
            search: "luc",
        });
    });

    it("GET /students/:id — 200 / 404", async () => {
        const getStudentById = mock.fn(async ({ id }) => {
            if (id === 1) return buildStudent({ id: 1 });
            throw new AppError("Alumno no encontrado.", {
                code: ErrorCode.STUDENT_NOT_FOUND,
                httpStatus: 404,
            });
        });
        const app = buildTestApp({ getStudentById });

        const ok = await request(app).get("/api/v1/students/1").expect(200);
        assert.equal(ok.body.id, 1);

        const missing = await request(app).get("/api/v1/students/99").expect(404);
        assert.equal(missing.body.error.code, ErrorCode.STUDENT_NOT_FOUND);
    });

    it("PATCH /students/:id — 200 actualiza type", async () => {
        const updateStudent = mock.fn(async () =>
            buildStudent({ type: "GUEST" })
        );
        const app = buildTestApp({ updateStudent });

        const response = await request(app)
            .patch("/api/v1/students/1")
            .send({ type: "GUEST", firstName: "María" })
            .expect(200);

        assert.equal(response.body.type, "GUEST");
        assert.deepEqual(updateStudent.mock.calls[0].arguments[0], {
            id: 1,
            type: "GUEST",
            firstName: "María",
        });
    });

    it("PATCH /students/:id/plan — 200 cambia plan", async () => {
        const changeStudentPlan = mock.fn(async () =>
            buildStudent({ planId: 2 })
        );
        const app = buildTestApp({ changeStudentPlan });

        const response = await request(app)
            .patch("/api/v1/students/1/plan")
            .send({ planId: 2 })
            .expect(200);

        assert.equal(response.body.planId, 2);
        assert.deepEqual(changeStudentPlan.mock.calls[0].arguments[0], {
            id: 1,
            planId: 2,
        });
    });

    it("PATCH /students/:id/suspend — 200 / 409", async () => {
        const suspendStudent = mock.fn(async ({ id }) => {
            if (id === 2) {
                throw new AppError("El alumno ya está suspendido.", {
                    code: ErrorCode.STUDENT_ALREADY_SUSPENDED,
                    httpStatus: 409,
                });
            }
            return buildStudent({ id, status: "SUSPENDED" });
        });
        const app = buildTestApp({ suspendStudent });

        const ok = await request(app)
            .patch("/api/v1/students/1/suspend")
            .expect(200);
        assert.equal(ok.body.status, "SUSPENDED");

        const conflict = await request(app)
            .patch("/api/v1/students/2/suspend")
            .expect(409);
        assert.equal(
            conflict.body.error.code,
            ErrorCode.STUDENT_ALREADY_SUSPENDED
        );
    });

    it("PATCH /students/:id/deactivate — 200", async () => {
        const deactivateStudent = mock.fn(async () =>
            buildStudent({ status: "INACTIVE" })
        );
        const app = buildTestApp({ deactivateStudent });

        const response = await request(app)
            .patch("/api/v1/students/1/deactivate")
            .expect(200);

        assert.equal(response.body.status, "INACTIVE");
    });

    it("POST /students — 409 email duplicado", async () => {
        const createStudent = mock.fn(async () => {
            throw new AppError("Ya existe un usuario con ese email.", {
                code: ErrorCode.EMAIL_ALREADY_EXISTS,
                httpStatus: 409,
            });
        });
        const app = buildTestApp({ createStudent });

        const response = await request(app)
            .post("/api/v1/students")
            .send({
                email: "alumno@pilates.test",
                firstName: "Lucía",
                lastName: "Pérez",
                planId: 1,
                type: "REGULAR",
            })
            .expect(409);

        assert.equal(response.body.error.code, ErrorCode.EMAIL_ALREADY_EXISTS);
    });
});
