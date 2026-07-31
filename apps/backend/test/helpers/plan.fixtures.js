import { mock } from "node:test";

const buildPlan = (overrides = {}) => ({
    id: 1,
    name: "Mensual 8",
    classesPerMonth: 8,
    price: "25000.00",
    active: true,
    ...overrides,
});

const buildCreatePlanInput = (overrides = {}) => ({
    name: "Mensual 8",
    classesPerMonth: 8,
    price: 25000,
    active: true,
    ...overrides,
});

const buildPlanRepositoryMock = (overrides = {}) => ({
    findById: mock.fn(async () => buildPlan()),
    findMany: mock.fn(async () => [buildPlan()]),
    create: mock.fn(async (data) =>
        buildPlan({
            ...data,
            price:
                typeof data.price === "number"
                    ? data.price.toFixed(2)
                    : data.price,
        })
    ),
    update: mock.fn(async (id, data) =>
        buildPlan({
            id,
            ...data,
            price:
                data.price !== undefined && typeof data.price === "number"
                    ? data.price.toFixed(2)
                    : data.price,
        })
    ),
    setActive: mock.fn(async (id, active) => buildPlan({ id, active })),
    ...overrides,
});

export {
    buildPlan,
    buildCreatePlanInput,
    buildPlanRepositoryMock,
};
