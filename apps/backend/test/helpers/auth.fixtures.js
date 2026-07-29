const buildActiveUser = (overrides = {}) => ({
    id: 1,
    email: "admin@pilates.test",
    passwordHash: "$2b$12$hashed",
    role: "ADMIN",
    status: "ACTIVE",
    firstName: "Ana",
    lastName: "García",
    avatarUrl: null,
    ...overrides,
});

export { buildActiveUser };
