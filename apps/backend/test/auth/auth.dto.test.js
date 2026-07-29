import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    mapLoginRequest,
    toAuthResponseDTO,
} from "../../src/modules/auth/interfaces/auth.dto.js";
import { buildActiveUser } from "../helpers/auth.fixtures.js";

describe("auth.dto", () => {
    describe("mapLoginRequest", () => {
        it("normaliza email (trim + lowercase) y conserva password", () => {
            const result = mapLoginRequest({
                email: "  Admin@Pilates.TEST  ",
                password: "Secreta123!",
            });

            assert.deepEqual(result, {
                email: "admin@pilates.test",
                password: "Secreta123!",
            });
        });

        it("devuelve email undefined si el body no trae email", () => {
            const result = mapLoginRequest({ password: "x" });

            assert.equal(result.email, undefined);
            assert.equal(result.password, "x");
        });

        it("tolera body vacío o undefined", () => {
            assert.deepEqual(mapLoginRequest(), {
                email: undefined,
                password: undefined,
            });
            assert.deepEqual(mapLoginRequest({}), {
                email: undefined,
                password: undefined,
            });
        });
    });

    describe("toAuthResponseDTO", () => {
        it("expone tokens y un user sin passwordHash ni avatarUrl", () => {
            const user = buildActiveUser({
                passwordHash: "secret-hash",
                avatarUrl: "https://cdn/avatar.png",
            });

            const dto = toAuthResponseDTO({
                accessToken: "access",
                refreshToken: "refresh",
                user,
            });

            assert.deepEqual(dto, {
                accessToken: "access",
                refreshToken: "refresh",
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                },
            });
            assert.equal("passwordHash" in dto.user, false);
            assert.equal("avatarUrl" in dto.user, false);
        });
    });
});
