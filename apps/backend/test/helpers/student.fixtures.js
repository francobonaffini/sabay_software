import { mock } from "node:test";

const buildPlan = (overrides = {}) => ({
    id: 1,
    name: "Mensual 8",
    classesPerMonth: 8,
    price: "25000.00",
    active: true,
    ...overrides,
});

const buildStudentUser = (overrides = {}) => ({
    id: 10,
    email: "alumno@pilates.test",
    firstName: "Lucía",
    lastName: "Pérez",
    phone: "111222333",
    role: "STUDENT",
    status: "PENDING",
    avatarUrl: "/media/avatars/default.webp",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
});

const buildStudent = (overrides = {}) => {
    const plan = overrides.plan === undefined ? buildPlan() : overrides.plan;
    const user = overrides.user === undefined ? buildStudentUser() : overrides.user;

    return {
        id: 1,
        userId: user?.id ?? 10,
        type: "REGULAR",
        planId: plan?.id ?? 1,
        notes: "Primera semana",
        status: "ACTIVE",
        plan,
        user,
        ...overrides,
    };
};

const buildCreateStudentInput = (overrides = {}) => ({
    email: "alumno@pilates.test",
    firstName: "Lucía",
    lastName: "Pérez",
    phone: "111222333",
    planId: 1,
    type: "REGULAR",
    notes: "Primera semana",
    ...overrides,
});

/**
 * Mock del repositorio Prisma de student para use cases.
 */
const buildStudentRepositoryMock = (overrides = {}) => ({
    findByEmail: mock.fn(async () => null),
    findPlanById: mock.fn(async () => buildPlan()),
    findById: mock.fn(async () => buildStudent()),
    findMany: mock.fn(async () => [buildStudent()]),
    createWithUser: mock.fn(async (data) =>
        buildStudent({
            ...data,
            user: buildStudentUser({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            }),
            plan: buildPlan({ id: data.planId }),
        })
    ),
    update: mock.fn(async (id) => buildStudent({ id })),
    updateStatus: mock.fn(async (id, status) => buildStudent({ id, status })),
    updatePlan: mock.fn(async (id, planId) =>
        buildStudent({ id, planId, plan: buildPlan({ id: planId }) })
    ),
    ...overrides,
});

export {
    buildPlan,
    buildStudentUser,
    buildStudent,
    buildCreateStudentInput,
    buildStudentRepositoryMock,
};
