import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { jwtService } from "../../src/modules/auth/infrastructure/security/jwtService.js";
import { buildActiveUser } from "../helpers/auth.fixtures.js";

describe("jwtService", () => {
    const user = buildActiveUser({ id: 42, role: "TEACHER" });

    before(() => {
        process.env.JWT_ACCESS_SECRET = "test-access-secret";
        process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
    });

    it("generateAccessToken firma un JWT con sub y role", async () => {
        const token = await jwtService.generateAccessToken(user);
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        assert.equal(payload.sub, user.id);
        assert.equal(payload.role, user.role);
        assert.ok(payload.exp > payload.iat);
    });

    it("generateRefreshToken firma un JWT solo con sub", async () => {
        const token = await jwtService.generateRefreshToken(user);
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        assert.equal(payload.sub, user.id);
        assert.equal(payload.role, undefined);
        assert.ok(payload.exp > payload.iat);
    });

    it("verifyAccessToken valida un access token válido", async () => {
        const token = await jwtService.generateAccessToken(user);
        const payload = await jwtService.verifyAccessToken(token);

        assert.equal(payload.sub, user.id);
        assert.equal(payload.role, user.role);
    });

    it("verifyRefreshToken valida un refresh token válido", async () => {
        const token = await jwtService.generateRefreshToken(user);
        const payload = await jwtService.verifyRefreshToken(token);

        assert.equal(payload.sub, user.id);
    });

    it("verifyAccessToken rechaza un token firmado con otro secreto", async () => {
        const forged = jwt.sign({ sub: user.id, role: user.role }, "otro-secreto");

        await assert.rejects(
            () => jwtService.verifyAccessToken(forged),
            (error) => error.name === "JsonWebTokenError"
        );
    });

    it("verifyRefreshToken rechaza un access token", async () => {
        const accessToken = await jwtService.generateAccessToken(user);

        await assert.rejects(
            () => jwtService.verifyRefreshToken(accessToken),
            (error) => error.name === "JsonWebTokenError"
        );
    });
});
