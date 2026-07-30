import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { updateStudentUseCase } from "../../src/modules/student/application/use-cases/updateStudent.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildStudent,
    buildStudentRepositoryMock,
} from "../helpers/student.fixtures.js";

describe("updateStudentUseCase", () => {
    it("actualiza datos de user y type del student", async () => {
        const current = buildStudent({ id: 3, status: "ACTIVE" });
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => current),
            findByEmail: mock.fn(async () => null),
            update: mock.fn(async () =>
                buildStudent({
                    id: 3,
                    type: "GUEST",
                    user: { ...current.user, firstName: "María" },
                })
            ),
        });
        const update = updateStudentUseCase({ studentRepository });

        const result = await update({
            id: 3,
            firstName: "  María ",
            type: "GUEST",
            notes: "  actualizado ",
        });

        assert.equal(result.type, "GUEST");
        assert.deepEqual(
            studentRepository.update.mock.calls[0].arguments,
            [
                3,
                {
                    user: { firstName: "María" },
                    student: { type: "GUEST", notes: "actualizado" },
                },
            ]
        );
    });

    it("permite mantener el mismo email sin chequear duplicado ajeno", async () => {
        const current = buildStudent();
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => current),
            findByEmail: mock.fn(async () => ({ id: current.user.id })),
        });
        const update = updateStudentUseCase({ studentRepository });

        await update({ id: current.id, email: current.user.email });

        assert.equal(studentRepository.findByEmail.mock.callCount(), 0);
        assert.equal(studentRepository.update.mock.callCount(), 1);
    });

    it("lanza EMAIL_ALREADY_EXISTS si el email pertenece a otro user", async () => {
        const current = buildStudent();
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => current),
            findByEmail: mock.fn(async () => ({ id: 999, email: "otro@mail.com" })),
        });
        const update = updateStudentUseCase({ studentRepository });

        await assert.rejects(
            () => update({ id: current.id, email: "otro@mail.com" }),
            (error) => error.code === ErrorCode.EMAIL_ALREADY_EXISTS
        );
    });

    it("lanza STUDENT_ALREADY_INACTIVE si el alumno está dado de baja", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => buildStudent({ status: "INACTIVE" })),
        });
        const update = updateStudentUseCase({ studentRepository });

        await assert.rejects(
            () => update({ id: 1, firstName: "X" }),
            (error) => error.code === ErrorCode.STUDENT_ALREADY_INACTIVE
        );
    });

    it("lanza STUDENT_NOT_FOUND si no existe", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => null),
        });
        const update = updateStudentUseCase({ studentRepository });

        await assert.rejects(
            () => update({ id: 50, firstName: "X" }),
            (error) => error.code === ErrorCode.STUDENT_NOT_FOUND
        );
    });

    it("lanza VALIDATION_ERROR si type es inválido", async () => {
        const update = updateStudentUseCase({
            studentRepository: buildStudentRepositoryMock(),
        });

        await assert.rejects(
            () => update({ id: 1, type: "VIP" }),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });
});
