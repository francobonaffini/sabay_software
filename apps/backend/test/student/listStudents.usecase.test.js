import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { listStudentsUseCase } from "../../src/modules/student/application/use-cases/listStudents.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildStudent,
    buildStudentRepositoryMock,
} from "../helpers/student.fixtures.js";

describe("listStudentsUseCase", () => {
    it("delega filtros válidos al repositorio", async () => {
        const students = [buildStudent({ id: 1 }), buildStudent({ id: 2 })];
        const studentRepository = buildStudentRepositoryMock({
            findMany: mock.fn(async () => students),
        });
        const list = listStudentsUseCase({ studentRepository });

        const result = await list({
            status: "ACTIVE",
            type: "REGULAR",
            search: "  luc  ",
        });

        assert.equal(result.length, 2);
        assert.deepEqual(
            studentRepository.findMany.mock.calls[0].arguments[0],
            {
                status: "ACTIVE",
                type: "REGULAR",
                search: "luc",
            }
        );
    });

    it("lanza VALIDATION_ERROR con status inválido", async () => {
        const list = listStudentsUseCase({
            studentRepository: buildStudentRepositoryMock(),
        });

        await assert.rejects(
            () => list({ status: "DELETED" }),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });

    it("lanza VALIDATION_ERROR con type inválido", async () => {
        const list = listStudentsUseCase({
            studentRepository: buildStudentRepositoryMock(),
        });

        await assert.rejects(
            () => list({ type: "VIP" }),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });
});
