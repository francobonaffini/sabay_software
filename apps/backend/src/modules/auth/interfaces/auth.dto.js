/**
 * Convierte el body del request al input esperado por el LoginUseCase.
 */
const mapLoginRequest = (body = {}) => ({
    email: body.email?.trim().toLowerCase(),
    password: body.password,
});

/**
 * Convierte la respuesta del LoginUseCase al DTO HTTP.
 */
const toAuthResponseDTO = ({
    accessToken,
    refreshToken,
    user,
}) => ({
    accessToken,
    refreshToken,
    user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
    },
});

export {
    mapLoginRequest,
    toAuthResponseDTO,
};
