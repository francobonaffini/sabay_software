import { describe, it } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { buildStudentRouter } from "../../src/modules/student/interfaces/student.routes.js";

const buildAppWithRouter = (controller) => {
    const app = express();
    app.use(express.json());
    app.use("/students", buildStudentRouter(controller));
    return app;
};

describe("buildStudentRouter", () => {
    it("registra todas las rutas del módulo student", async () => {
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
            changePlan: track("changePlan"),
            suspend: track("suspend"),
            deactivate: track("deactivate"),
        });

        await request(app).post("/students").send({}).expect(200);
        await request(app).get("/students").expect(200);
        await request(app).get("/students/1").expect(200);
        await request(app).patch("/students/1").send({}).expect(200);
        await request(app).patch("/students/1/plan").send({}).expect(200);
        await request(app).patch("/students/1/suspend").expect(200);
        await request(app).patch("/students/1/deactivate").expect(200);

        assert.deepEqual(hits, [
            "POST create",
            "GET list",
            "GET getById",
            "PATCH update",
            "PATCH changePlan",
            "PATCH suspend",
            "PATCH deactivate",
        ]);
    });

    it("responde 404 para rutas no registradas", async () => {
        const app = buildAppWithRouter({
            create: (_req, res) => res.status(200).end(),
            list: (_req, res) => res.status(200).end(),
            getById: (_req, res) => res.status(200).end(),
            update: (_req, res) => res.status(200).end(),
            changePlan: (_req, res) => res.status(200).end(),
            suspend: (_req, res) => res.status(200).end(),
            deactivate: (_req, res) => res.status(200).end(),
        });

        await request(app).delete("/students/1").expect(404);
        await request(app).post("/students/1/plan").expect(404);
    });
});
