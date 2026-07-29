import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

const passwordHasher = {

    hash: async (password) => {
        return await bcrypt.hash(password, SALT_ROUNDS);
    },

    compare: async (password, hash) => {
        return await bcrypt.compare(password, hash);
    },

};

export { passwordHasher };