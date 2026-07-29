import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { passwordHasher } from "../../src/modules/auth/infrastructure/security/passwordHasher.js";

describe("passwordHasher", () => {
    it("hashea una contraseña y genera un hash distinto al texto plano", async () => {
        const password = "Secreta123!";
        const hash = await passwordHasher.hash(password);

        assert.equal(typeof hash, "string");
        assert.notEqual(hash, password);
        assert.match(hash, /^\$2[aby]?\$/);
    });

    it("compare retorna true con la contraseña correcta", async () => {
        const password = "Secreta123!";
        const hash = await passwordHasher.hash(password);

        assert.equal(await passwordHasher.compare(password, hash), true);
    });

    it("compare retorna false con una contraseña incorrecta", async () => {
        const hash = await passwordHasher.hash("Secreta123!");

        assert.equal(await passwordHasher.compare("otra-clave", hash), false);
    });

    it("genera hashes distintos para la misma contraseña (salt)", async () => {
        const password = "MismaClave";
        const hashA = await passwordHasher.hash(password);
        const hashB = await passwordHasher.hash(password);

        assert.notEqual(hashA, hashB);
        assert.equal(await passwordHasher.compare(password, hashA), true);
        assert.equal(await passwordHasher.compare(password, hashB), true);
    });
});
