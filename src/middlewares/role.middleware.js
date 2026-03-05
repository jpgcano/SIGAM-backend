const roleMiddleware = (rolesPermitidos) => {
    return (req, res, next) => {
        // req.user viene cargado desde el auth.middleware.js
        if (!req.user || !rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "Acceso denegado: No tienes el rol necesario" 
            });
        }
        next();
    };
};

export default roleMiddleware;
