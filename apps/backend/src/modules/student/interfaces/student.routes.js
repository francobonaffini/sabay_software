import express from "express";

const buildStudentRouter = (controller) => {
    const router = express.Router();

    router.post("/", controller.create);
    router.get("/", controller.list);
    router.get("/:id", controller.getById);
    router.patch("/:id", controller.update);

    // Endpoints de acción específicos (antes de /:id)
    router.patch("/:id/plan", controller.changePlan);
    router.patch("/:id/suspend", controller.suspend);
    router.patch("/:id/activate", controller.activate);
    router.patch("/:id/deactivate", controller.deactivate);

    return router;
};

export { buildStudentRouter };
