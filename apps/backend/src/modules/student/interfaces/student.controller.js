import {
    mapChangePlanRequest,
    mapCreateStudentRequest,
    mapListStudentsQuery,
    mapStudentIdParam,
    mapUpdateStudentRequest,
    toStudentListResponseDTO,
    toStudentResponseDTO,
} from "./student.dto.js";

/**
 * @param {{
 *   createStudent: Function,
 *   getStudentById: Function,
 *   listStudents: Function,
 *   updateStudent: Function,
 *   changeStudentPlan: Function,
 *   suspendStudent: Function,
 *   activateStudent: Function,
 *   deactivateStudent: Function,
 * }} deps
 */
const buildStudentController = ({
    createStudent,
    getStudentById,
    listStudents,
    updateStudent,
    changeStudentPlan,
    suspendStudent,
    activateStudent,
    deactivateStudent,
}) => {
    return {
        create: async (req, res, next) => {
            try {
                const input = mapCreateStudentRequest(req.body);
                const student = await createStudent(input);
                return res.status(201).json(toStudentResponseDTO(student));
            } catch (error) {
                return next(error);
            }
        },

        getById: async (req, res, next) => {
            try {
                const { id } = mapStudentIdParam(req.params);
                const student = await getStudentById({ id });
                return res.status(200).json(toStudentResponseDTO(student));
            } catch (error) {
                return next(error);
            }
        },

        list: async (req, res, next) => {
            try {
                const filters = mapListStudentsQuery(req.query);
                const students = await listStudents(filters);
                return res.status(200).json(toStudentListResponseDTO(students));
            } catch (error) {
                return next(error);
            }
        },

        update: async (req, res, next) => {
            try {
                const { id } = mapStudentIdParam(req.params);
                const input = mapUpdateStudentRequest(req.body);
                const student = await updateStudent({ id, ...input });
                return res.status(200).json(toStudentResponseDTO(student));
            } catch (error) {
                return next(error);
            }
        },

        changePlan: async (req, res, next) => {
            try {
                const { id } = mapStudentIdParam(req.params);
                const { planId } = mapChangePlanRequest(req.body);
                const student = await changeStudentPlan({ id, planId });
                return res.status(200).json(toStudentResponseDTO(student));
            } catch (error) {
                return next(error);
            }
        },

        suspend: async (req, res, next) => {
            try {
                const { id } = mapStudentIdParam(req.params);
                const student = await suspendStudent({ id });
                return res.status(200).json(toStudentResponseDTO(student));
            } catch (error) {
                return next(error);
            }
        },

        activate: async (req, res, next) => {
            try {
                const { id } = mapStudentIdParam(req.params);
                const student = await activateStudent({ id });
                return res.status(200).json(toStudentResponseDTO(student));
            } catch (error) {
                return next(error);
            }
        },

        deactivate: async (req, res, next) => {
            try {
                const { id } = mapStudentIdParam(req.params);
                const student = await deactivateStudent({ id });
                return res.status(200).json(toStudentResponseDTO(student));
            } catch (error) {
                return next(error);
            }
        },
    };
};

export { buildStudentController };
