/**
 * POST /students → input del createStudentUseCase
 */
const mapCreateStudentRequest = (body = {}) => ({
    email: body.email?.trim().toLowerCase(),
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone,
    planId: body.planId !== undefined ? Number(body.planId) : undefined,
    type: body.type,
    notes: body.notes,
});

/**
 * PATCH /students/:id → input del updateStudentUseCase
 * type (REGULAR/GUEST) se cambia por este endpoint.
 * planId NO se maneja aquí: usar PATCH /students/:id/plan
 */
const mapUpdateStudentRequest = (body = {}) => {
    const input = {};

    if (body.email !== undefined) {
        input.email = body.email?.trim().toLowerCase();
    }
    if (body.firstName !== undefined) input.firstName = body.firstName;
    if (body.lastName !== undefined) input.lastName = body.lastName;
    if (body.phone !== undefined) input.phone = body.phone;
    if (body.type !== undefined) input.type = body.type;
    if (body.notes !== undefined) input.notes = body.notes;

    return input;
};

/**
 * PATCH /students/:id/plan → input del changeStudentPlanUseCase
 */
const mapChangePlanRequest = (body = {}) => ({
    planId: body.planId !== undefined ? Number(body.planId) : undefined,
});

/**
 * GET /students query params
 */
const mapListStudentsQuery = (query = {}) => ({
    status: query.status,
    type: query.type,
    search: query.search,
});

const mapStudentIdParam = (params = {}) => ({
    id: Number(params.id),
});

/**
 * Student completo (con user + plan) → DTO HTTP
 */
const toStudentResponseDTO = (student) => ({
    id: student.id,
    type: student.type,
    status: student.status,
    notes: student.notes,
    planId: student.planId,
    plan: student.plan
        ? {
              id: student.plan.id,
              name: student.plan.name,
              classesPerMonth: student.plan.classesPerMonth,
              price:
                  typeof student.plan.price?.toString === "function"
                      ? student.plan.price.toString()
                      : student.plan.price,
              active: student.plan.active,
          }
        : null,
    user: student.user
        ? {
              id: student.user.id,
              email: student.user.email,
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              phone: student.user.phone,
              role: student.user.role,
              status: student.user.status,
              avatarUrl: student.user.avatarUrl,
          }
        : null,
});

const toStudentListResponseDTO = (students) =>
    students.map(toStudentResponseDTO);

export {
    mapCreateStudentRequest,
    mapUpdateStudentRequest,
    mapChangePlanRequest,
    mapListStudentsQuery,
    mapStudentIdParam,
    toStudentResponseDTO,
    toStudentListResponseDTO,
};
