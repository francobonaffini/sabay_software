import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { deactivateStudentUseCase } from "../../src/modules/student/application/use-cases/deactivateStudent.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildStudent,
    buildStudentRepositoryMock,
} from "../helpers/student.fixtures.js";

describe("deactivateStudentUseCase", () => {
    it("da de baja un alumno ACTIVE", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => buildStudent({ status: "ACTIVE" })),
            updateStatus: mock.fn(async () =>
                buildStudent({ status: "INACTIVE" })
            ),
        });
        const deactivate = deactivateStudentUseCase({ studentRepository });

        const result = await deactivate({ id: 1 });

        assert.equal(result.status, "INACTIVE");
        assert.deepEqual(
            studentRepository.updateStatus.mock.calls[0].arguments,
            [1, "INACTIVE"]
        );
    });

    it("también permite dar de baja desde SUSPENDED", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () =>
                buildStudent({ status: "SUSPENDED" })
            ),
            updateStatus: mock.fn(async () =>
                buildStudent({ status: "INACTIVE" })
            ),
        });
        const deactivate = deactivateStudentUseCase({ studentRepository });

        await deactivate({ id: 1 });

        assert.equal(studentRepository.updateStatus.mock.callCount(), 1);
    });

    it("lanza STUDENT_ALREADY_INACTIVE si ya está dado de baja", async () => {
        const deactivate = deactivateStudentUseCase({
            studentRepository: buildStudentRepositoryMock({
                findById: mock.fn(async () =>
                    buildStudent({ status: "INACTIVE" })
                ),
            }),
        });

        await assert.rejects(
            () => deactivate({ id: 1 }),
            (error) => error.code === ErrorCode.STUDENT_ALREADY_INACTIVE
        );
    });

    it("lanza STUDENT_NOT_FOUND si no existe", async () => {
        const deactivate = deactivateStudentUseCase({
            studentRepository: buildStudentRepositoryMock({
                findById: mock.fn(async () => null),
            }),
        });

        await assert.rejects(
            () => deactivate({ id: 9 }),
            (error) => error.code === ErrorCode.STUDENT_NOT_FOUND
        );
    });
});
