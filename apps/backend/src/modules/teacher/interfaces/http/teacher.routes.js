import express from "express";

const buildTeacherRouter = (controller) => {
    const router = express.Router();

    router.post("/", controller.create);
    router.get("/", controller.search);
    router.get("/:id", controller.getById);
    router.patch("/:id", controller.update);
    router.patch("/:id/teacher-status", controller.changeStatus);

    return router;
};

export { buildTeacherRouter };
