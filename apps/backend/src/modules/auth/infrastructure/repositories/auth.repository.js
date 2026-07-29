import { prisma } from "../../../../shared/infrastructure/db/prismaClient.js";


const authRepository = {

    findUserForLogin: async (email) => {

        return await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                role: true,
                status: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
            },
        });

    },

};


export { authRepository };