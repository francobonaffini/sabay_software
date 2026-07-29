import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { buildApp } from "../../src/app.js";
import { buildV1Router } from "../../src/api/v1/v1.router.js";
import { buildAuthModule } from "../../src/modules/auth/interfaces/auth.module.js";
import { AppError } from "../../src/shared/errors/AppError.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import { buildActiveUser } from "../helpers/auth.fixtures.js";

const buildTestApp = (login) => {
    const authModule = buildAuthModule({ login });
    const v1Router = buildV1Router({ authModule });
    return buildApp({ v1Router });
};

describe("Auth HTTP — POST /api/v1/auth/login", () => {
    it("200 — login exitoso devuelve tokens y user público", async () => {
        const user = buildActiveUser();
        const login = mock.fn(async () => ({
            user,
            accessToken: "access.token",
            refreshToken: "refresh.token",
        }));
        const app = buildTestApp(login);

        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "  Admin@Pilates.TEST ",
                password: "Secreta123!",
            })
            .expect(200)
            .expect("Content-Type", /json/);

        assert.deepEqual(login.mock.calls[0].arguments[0], {
            email: "admin@pilates.test",
            password: "Secreta123!",
        });
        assert.equal(response.body.accessToken, "access.token");
        assert.equal(response.body.refreshToken, "refresh.token");
        assert.deepEqual(response.body.user, {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
        });
        assert.equal("passwordHash" in response.body.user, false);
    });

    it("401 — credenciales inválidas", async () => {
        const login = mock.fn(async () => {
            throw new AppError("Email o contraseña incorrectos.", {
                code: ErrorCode.INVALID_CREDENTIALS,
                httpStatus: 401,
            });
        });
        const app = buildTestApp(login);

        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "a@b.com", password: "mala" })
            .expect(401);

        assert.deepEqual(response.body, {
            error: {
                code: ErrorCode.INVALID_CREDENTIALS,
                message: "Email o contraseña incorrectos.",
            },
        });
    });

    it("403 — cuenta pendiente de activación", async () => {
        const login = mock.fn(async () => {
            throw new AppError("La cuenta aún no fue activada.", {
                code: ErrorCode.ACCOUNT_NOT_ACTIVATED,
                httpStatus: 403,
            });
        });
        const app = buildTestApp(login);

        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "a@b.com", password: "ok" })
            .expect(403);

        assert.equal(response.body.error.code, ErrorCode.ACCOUNT_NOT_ACTIVATED);
    });

    it("403 — cuenta suspendida", async () => {
        const login = mock.fn(async () => {
            throw new AppError("La cuenta se encuentra suspendida.", {
                code: ErrorCode.ACCOUNT_SUSPENDED,
                httpStatus: 403,
            });
        });
        const app = buildTestApp(login);

        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "a@b.com", password: "ok" })
            .expect(403);

        assert.equal(response.body.error.code, ErrorCode.ACCOUNT_SUSPENDED);
    });

    it("403 — cuenta inactiva", async () => {
        const login = mock.fn(async () => {
            throw new AppError("La cuenta fue dada de baja.", {
                code: ErrorCode.ACCOUNT_INACTIVE,
                httpStatus: 403,
            });
        });
        const app = buildTestApp(login);

        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "a@b.com", password: "ok" })
            .expect(403);

        assert.equal(response.body.error.code, ErrorCode.ACCOUNT_INACTIVE);
    });

    it("500 — error inesperado se mapea a INTERNAL_ERROR", async () => {
        const login = mock.fn(async () => {
            throw new Error("boom");
        });
        const app = buildTestApp(login);
        const consoleError = mock.method(console, "error", () => {});

        try {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "a@b.com", password: "ok" })
                .expect(500);

            assert.equal(response.body.error.code, ErrorCode.INTERNAL_ERROR);
        } finally {
            consoleError.mock.restore();
        }
    });
});
