import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createStudentUseCase } from "../../src/modules/student/application/use-cases/createStudent.usecase.js";
import { AppError } from "../../src/shared/errors/AppError.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import {
    buildCreateStudentInput,
    buildPlan,
    buildStudentRepositoryMock,
} from "../helpers/student.fixtures.js";

describe("createStudentUseCase", () => {
    it("crea User+Student cuando los datos son válidos", async () => {
        const studentRepository = buildStudentRepositoryMock();
        const createStudent = createStudentUseCase({ studentRepository });

        const result = await createStudent({
            ...buildCreateStudentInput(),
            email: "nuevo@pilates.test",
            firstName: "  Ana  ",
            lastName: "  López ",
            phone: " 999 ",
            notes: "  nota  ",
        });

        assert.equal(studentRepository.findByEmail.mock.callCount(), 1);
        assert.equal(studentRepository.findPlanById.mock.callCount(), 1);
        assert.equal(studentRepository.createWithUser.mock.callCount(), 1);
        assert.deepEqual(
            studentRepository.createWithUser.mock.calls[0].arguments[0],
            {
                email: "nuevo@pilates.test",
                firstName: "Ana",
                lastName: "López",
                phone: "999",
                planId: 1,
                type: "REGULAR",
                notes: "nota",
            }
        );
        assert.equal(result.type, "REGULAR");
        assert.equal(result.user.email, "nuevo@pilates.test");
    });

    it("lanza VALIDATION_ERROR si el email es inválido", async () => {
        const studentRepository = buildStudentRepositoryMock();
        const createStudent = createStudentUseCase({ studentRepository });

        await assert.rejects(
            () => createStudent(buildCreateStudentInput({ email: "malo" })),
            (error) =>
                error instanceof AppError &&
                error.code === ErrorCode.VALIDATION_ERROR &&
                error.httpStatus === 400
        );
        assert.equal(studentRepository.createWithUser.mock.callCount(), 0);
    });

    it("lanza VALIDATION_ERROR si faltan nombre o apellido", async () => {
        const createStudent = createStudentUseCase({
            studentRepository: buildStudentRepositoryMock(),
        });

        await assert.rejects(
            () => createStudent(buildCreateStudentInput({ firstName: "  " })),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });

    it("lanza VALIDATION_ERROR si type no es REGULAR/GUEST", async () => {
        const createStudent = createStudentUseCase({
            studentRepository: buildStudentRepositoryMock(),
        });

        await assert.rejects(
            () => createStudent(buildCreateStudentInput({ type: "VIP" })),
            (error) => error.code === ErrorCode.VALIDATION_ERROR
        );
    });

    it("lanza EMAIL_ALREADY_EXISTS si el email ya existe", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findByEmail: mock.fn(async () => ({
                id: 99,
                email: "alumno@pilates.test",
            })),
        });
        const createStudent = createStudentUseCase({ studentRepository });

        await assert.rejects(
            () => createStudent(buildCreateStudentInput()),
            (error) =>
                error.code === ErrorCode.EMAIL_ALREADY_EXISTS &&
                error.httpStatus === 409
        );
        assert.equal(studentRepository.createWithUser.mock.callCount(), 0);
    });

    it("lanza PLAN_NOT_FOUND si el plan no existe", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findPlanById: mock.fn(async () => null),
        });
        const createStudent = createStudentUseCase({ studentRepository });

        await assert.rejects(
            () => createStudent(buildCreateStudentInput()),
            (error) =>
                error.code === ErrorCode.PLAN_NOT_FOUND &&
                error.httpStatus === 404
        );
    });

    it("lanza PLAN_INACTIVE si el plan no está activo", async () => {
        const studentRepository = buildStudentRepositoryMock({
            findPlanById: mock.fn(async () => buildPlan({ active: false })),
        });
        const createStudent = createStudentUseCase({ studentRepository });

        await assert.rejects(
            () => createStudent(buildCreateStudentInput()),
            (error) =>
                error.code === ErrorCode.PLAN_INACTIVE &&
                error.httpStatus === 400
        );
    });
});
