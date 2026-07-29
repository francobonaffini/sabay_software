import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { buildAuthRouter } from "../../src/modules/auth/interfaces/auth.routes.js";

describe("buildAuthRouter", () => {
    it("registra POST /login y delega en el controller", async () => {
        const login = mock.fn((req, res) => {
            res.status(200).json({ ok: true, path: req.path });
        });
        const router = buildAuthRouter({ login });
        const app = express();
        app.use(express.json());
        app.use("/auth", router);

        const response = await request(app)
            .post("/auth/login")
            .send({ email: "a@b.com", password: "x" })
            .expect(200);

        assert.equal(login.mock.callCount(), 1);
        assert.deepEqual(response.body, { ok: true, path: "/login" });
    });

    it("responde 404 para métodos/rutas no registradas", async () => {
        const router = buildAuthRouter({
            login: (_req, res) => res.status(200).json({ ok: true }),
        });
        const app = express();
        app.use("/auth", router);

        await request(app).get("/auth/login").expect(404);
        await request(app).post("/auth/register").expect(404);
    });
});
