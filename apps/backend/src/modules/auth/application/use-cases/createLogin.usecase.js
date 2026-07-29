import { AppError } from "../../../../shared/errors/AppError.js";
import { ErrorCode } from "../../../../shared/errors/errorCode.js";

const createLoginUseCase = ({
    authRepository,
    passwordHasher,
    jwtService,
}) => {
    return async ({ email, password }) => {
        const user = await authRepository.findUserForLogin(email);

        if (!user) {
            throw new AppError("Email o contraseña incorrectos.", {
                code: ErrorCode.INVALID_CREDENTIALS,
                httpStatus: 401,
            });
        }

        const passwordMatches = await passwordHasher.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            throw new AppError("Email o contraseña incorrectos.", {
                code: ErrorCode.INVALID_CREDENTIALS,
                httpStatus: 401,
            });
        }

        switch (user.status) {
            case "PENDING":
                throw new AppError("La cuenta aún no fue activada.", {
                    code: ErrorCode.ACCOUNT_NOT_ACTIVATED,
                    httpStatus: 403,
                });

            case "SUSPENDED":
                throw new AppError("La cuenta se encuentra suspendida.", {
                    code: ErrorCode.ACCOUNT_SUSPENDED,
                    httpStatus: 403,
                });

            case "INACTIVE":
                throw new AppError("La cuenta fue dada de baja.", {
                    code: ErrorCode.ACCOUNT_INACTIVE,
                    httpStatus: 403,
                });
        }

        const accessToken = await jwtService.generateAccessToken(user);
        const refreshToken = await jwtService.generateRefreshToken(user);

        return {
            user,
            accessToken,
            refreshToken,
        };
    };
};

export { createLoginUseCase };
