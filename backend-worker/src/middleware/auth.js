import { jwt } from 'hono/jwt';

export const authMiddleware = (c, next) => {
    const jwtMiddleware = jwt({
        secret: c.env.JWT_SECRET,
        alg: 'HS256',
        header: 'Authorization',
        prefix: 'Bearer',
    });

    // Support both standard Bearer and legacy x-access-token
    const token = c.req.header('x-access-token') || c.req.header('Authorization')?.replace('Bearer ', '');
    if (token && !c.req.header('Authorization')) {
        c.req.header('Authorization', `Bearer ${token}`);
    }

    return jwtMiddleware(c, next);
};

export const getUserContext = (c) => {
    const payload = c.get('jwtPayload') || {};
    return {
        userId: payload.id,
        userName: payload.username,
        userRole: payload.role || payload.roles?.[0], // Handle both role and roles
        userPlant: payload.plant
    };
};
