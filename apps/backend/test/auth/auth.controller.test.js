import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { buildAuthController } from "../../src/modules/auth/interfaces/auth.controller.js";
import { AppError } from "../../src/shared/errors/AppError.js";
import { ErrorCode } from "../../src/shared/errors/errorCode.js";
import { buildActiveUser } from "../helpers/auth.fixtures.js";

const createMockRes = () => {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
    return res;
};

describe("buildAuthController", () => {
    it("responde 200 con el DTO de auth cuando login es exitoso", async () => {
        const user = buildActiveUser();
        const login = mock.fn(async () => ({
            user,
            accessToken: "access.token",
            refreshToken: "refresh.token",
        }));
        const controller = buildAuthController({ login });
        const req = {
            body: {
                email: "  Admin@Pilates.TEST ",
                password: "Secreta123!",
            },
        };
        const res = createMockRes();
        const next = mock.fn();

        await controller.login(req, res, next);

        assert.equal(login.mock.callCount(), 1);
        assert.deepEqual(login.mock.calls[0].arguments[0], {
            email: "admin@pilates.test",
            password: "Secreta123!",
        });
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.accessToken, "access.token");
        assert.equal(res.body.refreshToken, "refresh.token");
        assert.equal(res.body.user.email, user.email);
        assert.equal(next.mock.callCount(), 0);
    });

    it("delega el error a next cuando el use case falla", async () => {
        const error = new AppError("Email o contraseña incorrectos.", {
            code: ErrorCode.INVALID_CREDENTIALS,
            httpStatus: 401,
        });
        const login = mock.fn(async () => {
            throw error;
        });
        const controller = buildAuthController({ login });
        const res = createMockRes();
        const next = mock.fn();

        await controller.login(
            { body: { email: "a@b.com", password: "x" } },
            res,
            next
        );

        assert.equal(next.mock.callCount(), 1);
        assert.equal(next.mock.calls[0].arguments[0], error);
        assert.equal(res.statusCode, null);
    });
});
