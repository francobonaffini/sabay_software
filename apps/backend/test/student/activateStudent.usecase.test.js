import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { activateStudentUseCase } from "../../src/modules/student/application/use-cases/activateStudent.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildStudent,
    buildStudentRepositoryMock,
} from "../helpers/student.fixtures.js";

describe("activateStudentUseCase", () => {
    it("reactiva un alumno SUSPENDED a ACTIVE", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () =>
                buildStudent({ status: "SUSPENDED" })
            ),
            updateStatus: mock.fn(async () =>
                buildStudent({ status: "ACTIVE" })
            ),
        });
        const activate = activateStudentUseCase({ studentRepository });

        const result = await activate({ id: 1 });

        assert.equal(result.status, "ACTIVE");
        assert.deepEqual(
            studentRepository.updateStatus.mock.calls[0].arguments,
            [1, "ACTIVE"]
        );
    });

    it("lanza STUDENT_ALREADY_ACTIVE si ya está activo", async () => {
        const activate = activateStudentUseCase({
            studentRepository: buildStudentRepositoryMock({
                findById: mock.fn(async () =>
                    buildStudent({ status: "ACTIVE" })
                ),
            }),
        });

        await assert.rejects(
            () => activate({ id: 1 }),
            (error) =>
                error.code === ErrorCode.STUDENT_ALREADY_ACTIVE &&
                error.httpStatus === 409
        );
    });

    it("lanza STUDENT_ALREADY_INACTIVE si está dado de baja", async () => {
        const activate = activateStudentUseCase({
            studentRepository: buildStudentRepositoryMock({
                findById: mock.fn(async () =>
                    buildStudent({ status: "INACTIVE" })
                ),
            }),
        });

        await assert.rejects(
            () => activate({ id: 1 }),
            (error) => error.code === ErrorCode.STUDENT_ALREADY_INACTIVE
        );
    });

    it("lanza STUDENT_NOT_FOUND si no existe", async () => {
        const activate = activateStudentUseCase({
            studentRepository: buildStudentRepositoryMock({
                findById: mock.fn(async () => null),
            }),
        });

        await assert.rejects(
            () => activate({ id: 9 }),
            (error) => error.code === ErrorCode.STUDENT_NOT_FOUND
        );
    });
});
