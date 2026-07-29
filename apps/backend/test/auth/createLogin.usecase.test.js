import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createLoginUseCase } from "../../src/modules/auth/application/use-cases/createLogin.usecase.js";
import { AppError } from "../../src/shared/errors/AppError.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import { buildActiveUser } from "../helpers/auth.fixtures.js";

const buildDeps = ({ user = buildActiveUser(), passwordMatches = true } = {}) => {
    const authRepository = {
        findUserForLogin: mock.fn(async () => user),
    };

    const passwordHasher = {
        compare: mock.fn(async () => passwordMatches),
    };

    const jwtService = {
        generateAccessToken: mock.fn(async () => "access.token"),
        generateRefreshToken: mock.fn(async () => "refresh.token"),
    };

    return { authRepository, passwordHasher, jwtService };
};

describe("createLoginUseCase", () => {
    it("retorna user y tokens cuando las credenciales son válidas y el usuario está ACTIVE", async () => {
        const user = buildActiveUser();
        const deps = buildDeps({ user, passwordMatches: true });
        const login = createLoginUseCase(deps);

        const result = await login({
            email: user.email,
            password: "Secreta123!",
        });

        assert.deepEqual(result, {
            user,
            accessToken: "access.token",
            refreshToken: "refresh.token",
        });
        assert.equal(deps.authRepository.findUserForLogin.mock.callCount(), 1);
        assert.deepEqual(
            deps.authRepository.findUserForLogin.mock.calls[0].arguments,
            [user.email]
        );
        assert.equal(deps.passwordHasher.compare.mock.callCount(), 1);
        assert.equal(deps.jwtService.generateAccessToken.mock.callCount(), 1);
        assert.equal(deps.jwtService.generateRefreshToken.mock.callCount(), 1);
    });

    it("lanza INVALID_CREDENTIALS si el usuario no existe", async () => {
        const deps = buildDeps({ user: null });
        const login = createLoginUseCase(deps);

        await assert.rejects(
            () => login({ email: "noexiste@test.com", password: "x" }),
            (error) =>
                error instanceof AppError &&
                error.code === ErrorCode.INVALID_CREDENTIALS &&
                error.httpStatus === 401
        );

        assert.equal(deps.passwordHasher.compare.mock.callCount(), 0);
        assert.equal(deps.jwtService.generateAccessToken.mock.callCount(), 0);
    });

    it("lanza INVALID_CREDENTIALS si la contraseña no coincide", async () => {
        const deps = buildDeps({ passwordMatches: false });
        const login = createLoginUseCase(deps);

        await assert.rejects(
            () => login({ email: "admin@pilates.test", password: "mala" }),
            (error) =>
                error instanceof AppError &&
                error.code === ErrorCode.INVALID_CREDENTIALS &&
                error.httpStatus === 401
        );

        assert.equal(deps.jwtService.generateAccessToken.mock.callCount(), 0);
    });

    it("lanza ACCOUNT_NOT_ACTIVATED si el usuario está PENDING", async () => {
        const deps = buildDeps({
            user: buildActiveUser({ status: "PENDING" }),
        });
        const login = createLoginUseCase(deps);

        await assert.rejects(
            () => login({ email: "admin@pilates.test", password: "ok" }),
            (error) =>
                error instanceof AppError &&
                error.code === ErrorCode.ACCOUNT_NOT_ACTIVATED &&
                error.httpStatus === 403
        );
    });

    it("lanza ACCOUNT_SUSPENDED si el usuario está SUSPENDED", async () => {
        const deps = buildDeps({
            user: buildActiveUser({ status: "SUSPENDED" }),
        });
        const login = createLoginUseCase(deps);

        await assert.rejects(
            () => login({ email: "admin@pilates.test", password: "ok" }),
            (error) =>
                error instanceof AppError &&
                error.code === ErrorCode.ACCOUNT_SUSPENDED &&
                error.httpStatus === 403
        );
    });

    it("lanza ACCOUNT_INACTIVE si el usuario está INACTIVE", async () => {
        const deps = buildDeps({
            user: buildActiveUser({ status: "INACTIVE" }),
        });
        const login = createLoginUseCase(deps);

        await assert.rejects(
            () => login({ email: "admin@pilates.test", password: "ok" }),
            (error) =>
                error instanceof AppError &&
                error.code === ErrorCode.ACCOUNT_INACTIVE &&
                error.httpStatus === 403
        );
    });
});
