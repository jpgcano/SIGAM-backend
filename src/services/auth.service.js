import HashUtil from '../utils/hash.js';
import { ALLOWED_ROLES_SET } from '../config/roles.js';
import AuditLogService from './auditLog.service.js';

class AuthService {
    constructor(userModel, auditLogService = new AuditLogService()) {
        this.userModel = userModel;
        this.auditLogService = auditLogService;
    }

    async login(email, password, auditContext) {
        try {
            const user = await this.userModel.findByEmail(email);
            if (!user) {
                throw new Error('Credenciales inválidas');
            }

            const ok = await HashUtil.comparePassword(password, user.password_hash);
            if (!ok) {
                throw new Error('Credenciales inválidas');
            }

            this.auditLogService.safeLog(
                this.auditLogService.buildDomainEntry({
                    actor: { id: user.id_usuario, role: user.rol, email: user.email },
                    context: auditContext,
                    entidad: 'AUTH',
                    entidad_id: user.id_usuario,
                    accion: 'AUTH_LOGIN_SUCCESS',
                    metadata: { email: user.email }
                })
            );

            return {
                id: user.id_usuario,
                nombre: user.nombre,
                email: user.email,
                role: user.rol
            };
        } catch (error) {
            this.auditLogService.safeLog(
                this.auditLogService.buildDomainEntry({
                    actor: null,
                    context: auditContext,
                    entidad: 'AUTH',
                    entidad_id: null,
                    accion: 'AUTH_LOGIN_FAIL',
                    status: 'ERROR',
                    error,
                    metadata: { email }
                })
            );
            throw error;
        }
    }

    async register({ nombre, email, password, rol }, actor, auditContext) {
        const isGerente = actor?.role === 'Gerente';
        const desiredRole = rol || 'Usuario';

        const finalRole = isGerente ? desiredRole : 'Usuario';

        if (!ALLOWED_ROLES_SET.has(finalRole)) {
            throw { status: 400, message: `rol inválido: ${finalRole}` };
        }
        const passwordHash = await HashUtil.hashPassword(password);
        const created = await this.userModel.create({
            nombre,
            email,
            passwordHash,
            rol: finalRole
        });

        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor: actor || { id: created.id_usuario, role: created.rol, email: created.email },
                context: auditContext,
                entidad: 'USUARIO',
                entidad_id: created.id_usuario,
                accion: 'USUARIO_CREATE',
                payload_after: created,
                metadata: { creado_por: actor?.id ?? null }
            })
        );

        return {
            id: created.id_usuario,
            nombre: created.nombre,
            email: created.email,
            role: created.rol,
            fecha_creacion: created.fecha_creacion
        };
    }
}

export default AuthService;
