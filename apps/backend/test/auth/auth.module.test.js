import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { buildAuthModule } from "../../src/modules/auth/interfaces/auth.module.js";
import { buildActiveUser } from "../helpers/auth.fixtures.js";

describe("buildAuthModule", () => {
    it("expone basePath /auth y un router funcional", async () => {
        const user = buildActiveUser();
        const login = mock.fn(async () => ({
            user,
            accessToken: "a",
            refreshToken: "r",
        }));

        const module = buildAuthModule({ login });
        assert.equal(module.basePath, "/auth");

        const app = express();
        app.use(express.json());
        app.use(module.basePath, module.router);

        const response = await request(app)
            .post("/auth/login")
            .send({ email: user.email, password: "x" })
            .expect(200);

        assert.equal(response.body.accessToken, "a");
        assert.equal(response.body.user.id, user.id);
    });
});
