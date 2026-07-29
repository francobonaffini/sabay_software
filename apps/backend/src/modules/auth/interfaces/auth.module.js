import { createLoginUseCase } from "../application/use-cases/createLogin.usecase.js";
import { authRepository } from "../infrastructure/repositories/auth.repository.js";
import { jwtService } from "../infrastructure/security/jwtService.js";
import { passwordHasher } from "../infrastructure/security/passwordHasher.js";
import { buildAuthController } from "./auth.controller.js";
import { buildAuthRouter } from "./auth.routes.js";

/**
 * @param {{ login?: (input: { email?: string, password?: string }) => Promise<unknown> }} [deps]
 */
const buildAuthModule = ({ login } = {}) => {
    const loginUseCase =
        login ??
        createLoginUseCase({
            authRepository,
            passwordHasher,
            jwtService,
        });

    const controller = buildAuthController({ login: loginUseCase });
    const router = buildAuthRouter(controller);

    return {
        basePath: "/auth",
        router,
    };
};

export { buildAuthModule };
