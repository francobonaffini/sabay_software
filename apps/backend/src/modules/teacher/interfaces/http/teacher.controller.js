import {
    mapChangeTeacherStatusRequest,
    mapCreateTeacherRequest,
    mapSearchTeachersQuery,
    mapTeacherIdParam,
    mapUpdateTeacherRequest,
    toTeacherListResponseDTO,
    toTeacherResponseDTO,
} from "./teacher.dto.js";

/**
 * @param {{
 *   createTeacher: Function,
 *   getTeacherById: Function,
 *   searchTeachers: Function,
 *   updateTeacher: Function,
 *   changeTeacherStatus: Function,
 * }} deps
 */
const buildTeacherController = ({
    createTeacher,
    getTeacherById,
    searchTeachers,
    updateTeacher,
    changeTeacherStatus,
}) => {
    return {
        create: async (req, res, next) => {
            try {
                const input = mapCreateTeacherRequest(req.body);
                const teacher = await createTeacher(input);
                return res.status(201).json(toTeacherResponseDTO(teacher));
            } catch (error) {
                return next(error);
            }
        },

        getById: async (req, res, next) => {
            try {
                const { id } = mapTeacherIdParam(req.params);
                const teacher = await getTeacherById({ id });
                return res.status(200).json(toTeacherResponseDTO(teacher));
            } catch (error) {
                return next(error);
            }
        },

        search: async (req, res, next) => {
            try {
                const filters = mapSearchTeachersQuery(req.query);
                const teachers = await searchTeachers(filters);
                return res.status(200).json(toTeacherListResponseDTO(teachers));
            } catch (error) {
                return next(error);
            }
        },

        update: async (req, res, next) => {
            try {
                const { id } = mapTeacherIdParam(req.params);
                const input = mapUpdateTeacherRequest(req.body);
                const teacher = await updateTeacher({ id, ...input });
                return res.status(200).json(toTeacherResponseDTO(teacher));
            } catch (error) {
                return next(error);
            }
        },

        changeStatus: async (req, res, next) => {
            try {
                const { id } = mapTeacherIdParam(req.params);
                const { teacherStatus } = mapChangeTeacherStatusRequest(req.body);
                const teacher = await changeTeacherStatus({ id, teacherStatus });
                return res.status(200).json(toTeacherResponseDTO(teacher));
            } catch (error) {
                return next(error);
            }
        },
    };
};

export { buildTeacherController };
