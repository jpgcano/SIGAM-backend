import { PERMISSIONS, isRoleAllowed } from '../config/permissions.js';

const permit = (resource, action) => {
    return (req, res, next) => {
        try {
            const allowed = PERMISSIONS?.[resource]?.[action];
            if (!allowed) {
                throw { status: 500, message: `Permisos no configurados: ${resource}.${action}` };
            }

            const role = req.user?.role;
            if (!role || !isRoleAllowed(role, allowed)) {
                return res.status(403).json({ message: 'Acceso denegado: No tienes el rol necesario' });
            }

            next();
        } catch (e) {
            next(e);
        }
    };
};

export default permit;

