import { prisma } from "../../../../shared/infrastructure/db/prismaClient.js";

const planSelect = {
    id: true,
    name: true,
    classesPerMonth: true,
    price: true,
    active: true,
};

const planRepository = {
    findById: async (id) => {
        return prisma.plan.findUnique({
            where: { id },
            select: planSelect,
        });
    },

    findMany: async ({ active } = {}) => {
        const where = {};

        if (typeof active === "boolean") {
            where.active = active;
        }

        return prisma.plan.findMany({
            where,
            select: planSelect,
            orderBy: { id: "desc" },
        });
    },

    create: async ({ name, classesPerMonth, price, active = true }) => {
        return prisma.plan.create({
            data: {
                name,
                classesPerMonth,
                price,
                active,
            },
            select: planSelect,
        });
    },

    update: async (id, data) => {
        return prisma.plan.update({
            where: { id },
            data,
            select: planSelect,
        });
    },

    setActive: async (id, active) => {
        return prisma.plan.update({
            where: { id },
            data: { active },
            select: planSelect,
        });
    },
};

export { planRepository };
