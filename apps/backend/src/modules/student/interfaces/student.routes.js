import express from "express";

const buildStudentRouter = (controller) => {
    const router = express.Router();

    router.post("/", controller.create);
    router.get("/", controller.list);
    router.get("/:id", controller.getById);
    router.patch("/:id", controller.update);
    router.patch("/:id/plan", controller.changePlan);
    router.patch("/:id/suspend", controller.suspend);
    router.patch("/:id/deactivate", controller.deactivate);

    return router;
};

export { buildStudentRouter };
