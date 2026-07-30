import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { suspendStudentUseCase } from "../../src/modules/student/application/use-cases/suspendStudent.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildStudent,
    buildStudentRepositoryMock,
} from "../helpers/student.fixtures.js";

describe("suspendStudentUseCase", () => {
    it("suspende un alumno ACTIVE", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => buildStudent({ status: "ACTIVE" })),
            updateStatus: mock.fn(async () =>
                buildStudent({ status: "SUSPENDED" })
            ),
        });
        const suspend = suspendStudentUseCase({ studentRepository });

        const result = await suspend({ id: 1 });

        assert.equal(result.status, "SUSPENDED");
        assert.deepEqual(
            studentRepository.updateStatus.mock.calls[0].arguments,
            [1, "SUSPENDED"]
        );
    });

    it("lanza STUDENT_ALREADY_SUSPENDED si ya está suspendido", async () => {
        const suspend = suspendStudentUseCase({
            studentRepository: buildStudentRepositoryMock({
                findById: mock.fn(async () =>
                    buildStudent({ status: "SUSPENDED" })
                ),
            }),
        });

        await assert.rejects(
            () => suspend({ id: 1 }),
            (error) => error.code === ErrorCode.STUDENT_ALREADY_SUSPENDED
        );
    });

    it("lanza STUDENT_ALREADY_INACTIVE si está dado de baja", async () => {
        const suspend = suspendStudentUseCase({
            studentRepository: buildStudentRepositoryMock({
                findById: mock.fn(async () =>
                    buildStudent({ status: "INACTIVE" })
                ),
            }),
        });

        await assert.rejects(
            () => suspend({ id: 1 }),
            (error) => error.code === ErrorCode.STUDENT_ALREADY_INACTIVE
        );
    });

    it("lanza STUDENT_NOT_FOUND si no existe", async () => {
        const suspend = suspendStudentUseCase({
            studentRepository: buildStudentRepositoryMock({
                findById: mock.fn(async () => null),
            }),
        });

        await assert.rejects(
            () => suspend({ id: 9 }),
            (error) => error.code === ErrorCode.STUDENT_NOT_FOUND
        );
    });
});
