/**
 * POST /teachers → input del createTeacherUseCase
 */
const mapCreateTeacherRequest = (body = {}) => ({
    email: body.email?.trim().toLowerCase(),
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone,
    color: body.color,
});

/**
 * PATCH /teachers/:id → input del updateTeacherUseCase
 */
const mapUpdateTeacherRequest = (body = {}) => {
    const input = {};

    if (body.email !== undefined) {
        input.email = body.email?.trim().toLowerCase();
    }
    if (body.firstName !== undefined) input.firstName = body.firstName;
    if (body.lastName !== undefined) input.lastName = body.lastName;
    if (body.phone !== undefined) input.phone = body.phone;
    if (body.color !== undefined) input.color = body.color;

    return input;
};

/**
 * PATCH /teachers/:id/teacher-status
 */
const mapChangeTeacherStatusRequest = (body = {}) => ({
    teacherStatus: body.teacherStatus,
});

/**
 * GET /teachers query params
 */
const mapSearchTeachersQuery = (query = {}) => ({
    teacherStatus: query.teacherStatus,
    search: query.search,
});

const mapTeacherIdParam = (params = {}) => ({
    id: Number(params.id),
});

/**
 * Teacher completo (con user) → DTO HTTP
 */
const toTeacherResponseDTO = (teacher) => ({
    id: teacher.id,
    color: teacher.color,
    teacherStatus: teacher.status,
    user: teacher.user
        ? {
              id: teacher.user.id,
              email: teacher.user.email,
              firstName: teacher.user.firstName,
              lastName: teacher.user.lastName,
              phone: teacher.user.phone,
              role: teacher.user.role,
              userStatus: teacher.user.status,
              avatarUrl: teacher.user.avatarUrl,
          }
        : null,
});

const toTeacherListResponseDTO = (teachers) =>
    teachers.map(toTeacherResponseDTO);

export {
    mapCreateTeacherRequest,
    mapUpdateTeacherRequest,
    mapChangeTeacherStatusRequest,
    mapSearchTeachersQuery,
    mapTeacherIdParam,
    toTeacherResponseDTO,
    toTeacherListResponseDTO,
};
