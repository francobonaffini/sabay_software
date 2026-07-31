import { describe, it } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { buildPlanRouter } from "../../src/modules/plan/interfaces/http/plan.routes.js";

const buildAppWithRouter = (controller) => {
    const app = express();
    app.use(express.json());
    app.use("/plans", buildPlanRouter(controller));
    return app;
};

describe("buildPlanRouter", () => {
    it("registra todas las rutas del módulo plan", async () => {
        const hits = [];
        const track =
            (name) =>
            (req, res) => {
                hits.push(`${req.method} ${name}`);
                res.status(200).json({ ok: name });
            };

        const app = buildAppWithRouter({
            create: track("create"),
            list: track("list"),
            getById: track("getById"),
            update: track("update"),
            activate: track("activate"),
            deactivate: track("deactivate"),
        });

        await request(app).post("/plans").send({}).expect(200);
        await request(app).get("/plans").expect(200);
        await request(app).get("/plans/1").expect(200);
        await request(app).patch("/plans/1").send({}).expect(200);
        await request(app).patch("/plans/1/activate").expect(200);
        await request(app).patch("/plans/1/deactivate").expect(200);

        assert.deepEqual(hits, [
            "POST create",
            "GET list",
            "GET getById",
            "PATCH update",
            "PATCH activate",
            "PATCH deactivate",
        ]);
    });

    it("responde 404 para rutas no registradas", async () => {
        const app = buildAppWithRouter({
            create: (_req, res) => res.status(200).end(),
            list: (_req, res) => res.status(200).end(),
            getById: (_req, res) => res.status(200).end(),
            update: (_req, res) => res.status(200).end(),
            activate: (_req, res) => res.status(200).end(),
            deactivate: (_req, res) => res.status(200).end(),
        });

        await request(app).delete("/plans/1").expect(404);
        await request(app).post("/plans/1/activate").expect(404);
    });
});
