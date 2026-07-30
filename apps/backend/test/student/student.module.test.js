import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { buildStudentModule } from "../../src/modules/student/interfaces/student.module.js";
import { buildStudent } from "../helpers/student.fixtures.js";

describe("buildStudentModule", () => {
    it("expone basePath /students y un router funcional", async () => {
        const student = buildStudent();
        const createStudent = mock.fn(async () => student);
        const module = buildStudentModule({ createStudent });

        assert.equal(module.basePath, "/students");

        const app = express();
        app.use(express.json());
        app.use(module.basePath, module.router);

        const response = await request(app)
            .post("/students")
            .send({
                email: "alumno@pilates.test",
                firstName: "Lucía",
                lastName: "Pérez",
                planId: 1,
                type: "REGULAR",
            })
            .expect(201);

        assert.equal(response.body.id, student.id);
        assert.equal(createStudent.mock.callCount(), 1);
    });
});
