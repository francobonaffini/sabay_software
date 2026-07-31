import {
    mapCreatePlanRequest,
    mapListPlansQuery,
    mapPlanIdParam,
    mapUpdatePlanRequest,
    toPlanListResponseDTO,
    toPlanResponseDTO,
} from "./plan.dto.js";

/**
 * @param {{
 *   createPlan: Function,
 *   getPlanById: Function,
 *   listPlans: Function,
 *   updatePlan: Function,
 *   activatePlan: Function,
 *   deactivatePlan: Function,
 * }} deps
 */
const buildPlanController = ({
    createPlan,
    getPlanById,
    listPlans,
    updatePlan,
    activatePlan,
    deactivatePlan,
}) => {
    return {
        create: async (req, res, next) => {
            try {
                const input = mapCreatePlanRequest(req.body);
                const plan = await createPlan(input);
                return res.status(201).json(toPlanResponseDTO(plan));
            } catch (error) {
                return next(error);
            }
        },

        getById: async (req, res, next) => {
            try {
                const { id } = mapPlanIdParam(req.params);
                const plan = await getPlanById({ id });
                return res.status(200).json(toPlanResponseDTO(plan));
            } catch (error) {
                return next(error);
            }
        },

        list: async (req, res, next) => {
            try {
                const filters = mapListPlansQuery(req.query);
                const plans = await listPlans(filters);
                return res.status(200).json(toPlanListResponseDTO(plans));
            } catch (error) {
                return next(error);
            }
        },

        update: async (req, res, next) => {
            try {
                const { id } = mapPlanIdParam(req.params);
                const input = mapUpdatePlanRequest(req.body);
                const plan = await updatePlan({ id, ...input });
                return res.status(200).json(toPlanResponseDTO(plan));
            } catch (error) {
                return next(error);
            }
        },

        activate: async (req, res, next) => {
            try {
                const { id } = mapPlanIdParam(req.params);
                const plan = await activatePlan({ id });
                return res.status(200).json(toPlanResponseDTO(plan));
            } catch (error) {
                return next(error);
            }
        },

        deactivate: async (req, res, next) => {
            try {
                const { id } = mapPlanIdParam(req.params);
                const plan = await deactivatePlan({ id });
                return res.status(200).json(toPlanResponseDTO(plan));
            } catch (error) {
                return next(error);
            }
        },
    };
};

export { buildPlanController };
