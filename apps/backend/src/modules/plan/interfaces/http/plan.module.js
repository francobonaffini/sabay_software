import { activatePlanUseCase } from "../../application/use-cases/activatePlan.usecase.js";
import { createPlanUseCase } from "../../application/use-cases/createPlan.usecase.js";
import { deactivatePlanUseCase } from "../../application/use-cases/deactivatePlan.usecase.js";
import { getPlanByIdUseCase } from "../../application/use-cases/getPlanById.usecase.js";
import { listPlansUseCase } from "../../application/use-cases/listPlans.usecase.js";
import { updatePlanUseCase } from "../../application/use-cases/updatePlan.usecase.js";
import { planRepository } from "../../infrastructure/repositories/plan.repository.js";
import { buildPlanController } from "./plan.controller.js";
import { buildPlanRouter } from "./plan.routes.js";

/**
 * @param {{
 *   planRepository?: typeof planRepository,
 *   createPlan?: Function,
 *   getPlanById?: Function,
 *   listPlans?: Function,
 *   updatePlan?: Function,
 *   activatePlan?: Function,
 *   deactivatePlan?: Function,
 * }} [deps]
 */
const buildPlanModule = ({
    planRepository: repository = planRepository,
    createPlan,
    getPlanById,
    listPlans,
    updatePlan,
    activatePlan,
    deactivatePlan,
} = {}) => {
    const deps = { planRepository: repository };

    const controller = buildPlanController({
        createPlan: createPlan ?? createPlanUseCase(deps),
        getPlanById: getPlanById ?? getPlanByIdUseCase(deps),
        listPlans: listPlans ?? listPlansUseCase(deps),
        updatePlan: updatePlan ?? updatePlanUseCase(deps),
        activatePlan: activatePlan ?? activatePlanUseCase(deps),
        deactivatePlan: deactivatePlan ?? deactivatePlanUseCase(deps),
    });

    const router = buildPlanRouter(controller);

    return {
        basePath: "/plans",
        router,
    };
};

export { buildPlanModule };
