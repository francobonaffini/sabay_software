import { mapLoginRequest, toAuthResponseDTO } from "./auth.dto.js";

/**
 * @param {{ login: (input: { email?: string, password?: string }) => Promise<unknown> }} deps
 */
const buildAuthController = ({ login }) => {
    return {
        login: async (req, res, next) => {
            try {
                const input = mapLoginRequest(req.body);
                const result = await login(input);
                return res.status(200).json(toAuthResponseDTO(result));
            } catch (error) {
                return next(error);
            }
        },
    };
};

export { buildAuthController };
