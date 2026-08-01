import { prisma } from "../../../../shared/infrastructure/db/prismaClient.js";

const DEFAULT_AVATAR_URL = "/media/avatars/default.webp";

const teacherInclude = {
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
};

const teacherPrismaRepository = {
    findByEmail: async (email) => {
        return prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true },
        });
    },

    findById: async (id) => {
        return prisma.teacher.findUnique({
            where: { id },
            include: teacherInclude,
        });
    },

    search: async ({ status, search } = {}) => {
        const where = {};

        if (status) where.status = status;

        if (search) {
            where.user = {
                OR: [
                    { email: { contains: search, mode: "insensitive" } },
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                ],
            };
        }

        return prisma.teacher.findMany({
            where,
            include: teacherInclude,
            orderBy: { id: "desc" },
        });
    },

    /**
     * Crea User + Teacher en una sola transacción.
     */
    createWithUser: async ({
        email,
        firstName,
        lastName,
        phone,
        color,
    }) => {
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                    phone: phone ?? null,
                    role: "TEACHER",
                    status: "PENDING",
                    passwordHash: null,
                    avatarUrl: DEFAULT_AVATAR_URL,
                },
            });

            return tx.teacher.create({
                data: {
                    userId: user.id,
                    color: color ?? null,
                    status: "ACTIVE",
                },
                include: teacherInclude,
            });
        });
    },

    update: async (id, { user, teacher }) => {
        return prisma.$transaction(async (tx) => {
            const current = await tx.teacher.findUnique({
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

            return tx.teacher.update({
                where: { id },
                data: teacher ?? {},
                include: teacherInclude,
            });
        });
    },

    updateStatus: async (id, status) => {
        return prisma.$transaction(async (tx) => {
            const current = await tx.teacher.findUnique({
                where: { id },
                select: { userId: true },
            });

            if (!current) return null;

            if (current.userId) {
                if (status === "INACTIVE") {
                    await tx.user.update({
                        where: { id: current.userId },
                        data: { status: "INACTIVE" },
                    });
                }

                if (status === "ACTIVE") {
                    await tx.user.update({
                        where: { id: current.userId },
                        data: { status: "ACTIVE" },
                    });
                }
            }

            return tx.teacher.update({
                where: { id },
                data: { status },
                include: teacherInclude,
            });
        });
    },
};

export { teacherPrismaRepository };
