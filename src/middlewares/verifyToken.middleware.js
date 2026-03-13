import jwt from 'jsonwebtoken';
import AuditLogService from '../services/auditLog.service.js';
import buildAuditContext from '../utils/auditContext.js';

const verifyToken = (auditLogService = new AuditLogService()) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            auditLogService.safeLog(
                auditLogService.buildDomainEntry({
                    actor: null,
                    context: buildAuditContext(req),
                    entidad: 'AUTH',
                    accion: 'AUTH_TOKEN_MISSING',
                    status: 'ERROR'
                })
            );
            return res.status(401).json({ message: 'Acceso denegado: Token no proporcionado' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            auditLogService.safeLog(
                auditLogService.buildDomainEntry({
                    actor: null,
                    context: buildAuditContext(req),
                    entidad: 'AUTH',
                    accion: 'AUTH_TOKEN_INVALID',
                    status: 'ERROR',
                    error
                })
            );
            return res.status(401).json({ message: 'Token no válido o expirado' });
        }
    };
};

export default verifyToken;
