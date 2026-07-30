import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { getStudentByIdUseCase } from "../../src/modules/student/application/use-cases/getStudentById.usecase.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildStudent,
    buildStudentRepositoryMock,
} from "../helpers/student.fixtures.js";

describe("getStudentByIdUseCase", () => {
    it("retorna el student cuando existe", async () => {
        const student = buildStudent({ id: 7 });
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => student),
        });
        const getById = getStudentByIdUseCase({ studentRepository });

        const result = await getById({ id: 7 });

        assert.equal(result.id, 7);
        assert.equal(studentRepository.findById.mock.callCount(), 1);
    });

    it("lanza VALIDATION_ERROR si id es inválido", async () => {
        const getById = getStudentByIdUseCase({
            studentRepository: buildStudentRepositoryMock(),
        });

        await assert.rejects(
            () => getById({ id: -1 }),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });

    it("lanza STUDENT_NOT_FOUND si no existe", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findById: mock.fn(async () => null),
        });
        const getById = getStudentByIdUseCase({ studentRepository });

        await assert.rejects(
            () => getById({ id: 99 }),
            (error) =>
                error.code === ErrorCode.STUDENT_NOT_FOUND &&
                error.httpStatus === 404
        );
    });
});
