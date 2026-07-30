import { prisma } from "../../../../shared/infrastructure/db/prismaClient.js";

const studentInclude = {
    user: {
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            status: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
        },
    },
    plan: {
        select: {
            id: true,
            name: true,
            classesPerMonth: true,
            price: true,
            active: true,
        },
    },
};

const studentPrismaRepository = {
    findByEmail: async (email) => {
        return prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true },
        });
    },

    findPlanById: async (planId) => {
        return prisma.plan.findUnique({
            where: { id: planId },
            select: {
                id: true,
                name: true,
                classesPerMonth: true,
                price: true,
                active: true,
            },
        });
    },

    findById: async (id) => {
        return prisma.student.findUnique({
            where: { id },
            include: studentInclude,
        });
    },

    findMany: async ({ status, type, search } = {}) => {
        const where = {};

        if (status) where.status = status;
        if (type) where.type = type;

        if (search) {
            where.user = {
                OR: [
                    { email: { contains: search, mode: "insensitive" } },
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                ],
            };
        }

        return prisma.student.findMany({
            where,
            include: studentInclude,
            orderBy: { id: "desc" },
        });
    },

    /**
     * Crea User + Student en una sola transacción.
     * Si falla Student, se revierte el User.
     */
    createWithUser: async ({
        email,
        firstName,
        lastName,
        phone,
        planId,
        type,
        notes,
    }) => {
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                    phone: phone ?? null,
                    role: "STUDENT",
                    status: "PENDING",
                    passwordHash: null,
                },
            });

            return tx.student.create({
                data: {
                    userId: user.id,
                    planId,
                    type,
                    notes: notes ?? null,
                    status: "ACTIVE",
                },
                include: studentInclude,
            });
        });
    },

    /**
     * Actualiza datos del Student y de su User asociado.
     */
    update: async (id, { user, student }) => {
        return prisma.$transaction(async (tx) => {
            const current = await tx.student.findUnique({
                where: { id },
                select: { userId: true },
            });

            if (!current) return null;

            if (user && current.userId) {
                await tx.user.update({
                    where: { id: current.userId },
                    data: user,
                });
            }

            return tx.student.update({
                where: { id },
                data: student ?? {},
                include: studentInclude,
            });
        });
    },

    updateStatus: async (id, status) => {
        return prisma.$transaction(async (tx) => {
            const current = await tx.student.findUnique({
                where: { id },
                select: { userId: true },
            });

            if (!current) return null;

            if (status === "INACTIVE" && current.userId) {
                await tx.user.update({
                    where: { id: current.userId },
                    data: { status: "INACTIVE" },
                });
            }

            return tx.student.update({
                where: { id },
                data: { status },
                include: studentInclude,
            });
        });
    },

    updatePlan: async (id, planId) => {
        return prisma.student.update({
            where: { id },
            data: { planId },
            include: studentInclude,
        });
    },
};

export { studentPrismaRepository };
