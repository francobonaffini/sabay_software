import express from "express";

const buildAuthRouter = (controller) => {
    const router = express.Router();

    router.post("/login", controller.login);

    return router;
};

export { buildAuthRouter };