import express from "express";

const buildPlanRouter = (controller) => {
    const router = express.Router();

    router.post("/", controller.create);
    router.get("/", controller.list);
    router.get("/:id", controller.getById);
    router.patch("/:id", controller.update);
    router.patch("/:id/activate", controller.activate);
    router.patch("/:id/deactivate", controller.deactivate);

    return router;
};

export { buildPlanRouter };
