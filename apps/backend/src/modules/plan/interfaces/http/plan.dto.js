/**
 * POST /plans → input del createPlanUseCase
 */
const mapCreatePlanRequest = (body = {}) => ({
    name: body.name,
    classesPerMonth:
        body.classesPerMonth !== undefined
            ? Number(body.classesPerMonth)
            : undefined,
    price: body.price !== undefined ? Number(body.price) : undefined,
    active: body.active,
});

/**
 * PATCH /plans/:id → input del updatePlanUseCase
 */
const mapUpdatePlanRequest = (body = {}) => {
    const input = {};

    if (body.name !== undefined) input.name = body.name;
    if (body.classesPerMonth !== undefined) {
        input.classesPerMonth = Number(body.classesPerMonth);
    }
    if (body.price !== undefined) input.price = Number(body.price);

    return input;
};

/**
 * GET /plans query params
 */
const mapListPlansQuery = (query = {}) => {
    const filters = {};

    if (query.active !== undefined) {
        if (query.active === "true" || query.active === true) {
            filters.active = true;
        } else if (query.active === "false" || query.active === false) {
            filters.active = false;
        } else {
            filters.active = query.active;
        }
    }

    return filters;
};

const mapPlanIdParam = (params = {}) => ({
    id: Number(params.id),
});

/**
 * Plan → DTO HTTP (Decimal de Prisma como string)
 */
const toPlanResponseDTO = (plan) => ({
    id: plan.id,
    name: plan.name,
    classesPerMonth: plan.classesPerMonth,
    price:
        typeof plan.price?.toString === "function"
            ? plan.price.toString()
            : plan.price,
    active: plan.active,
});

const toPlanListResponseDTO = (plans) => plans.map(toPlanResponseDTO);

export {
    mapCreatePlanRequest,
    mapUpdatePlanRequest,
    mapListPlansQuery,
    mapPlanIdParam,
    toPlanResponseDTO,
    toPlanListResponseDTO,
};
