import HashUtil from '../utils/hash.js';
import { ALLOWED_ROLES_SET } from '../config/roles.js';
import AuditLogService from './auditLog.service.js';

// Users service: business rules for user lifecycle.
class UserService {
    constructor(userModel, auditLogService = new AuditLogService()) {
        this.userModel = userModel;
        this.auditLogService = auditLogService;
    }

    // List users (no auth checks here; handled by middleware).
    async findAll() {
        return this.userModel.findAll();
    }

    // Create user with hashed password and audit logs.
    async create(payload, actor, auditContext) {
        const { nombre, email, password, rol } = payload;
        if (!ALLOWED_ROLES_SET.has(rol)) {
            throw { status: 400, message: `rol inválido: ${rol}` };
        }
        const passwordHash = await HashUtil.hashPassword(password);
        const created = await this.userModel.create({ nombre, email, passwordHash, rol });
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'USUARIO',
                entidad_id: created?.id_usuario,
                accion: 'USUARIO_CREATE',
                payload_after: created
            })
        );
        if (rol !== 'Usuario') {
            this.auditLogService.safeLog(
                this.auditLogService.buildDomainEntry({
                    actor,
                    context: auditContext,
                    entidad: 'AUTH',
                    entidad_id: created?.id_usuario,
                    accion: 'SECURITY_ROLE_ASSIGN',
                    metadata: { rol_asignado: rol, creado_por: actor?.id ?? null }
                })
            );
        }
        return created;
    }

    // Change user role with audit trail.
    async updateRole(id, rol, actor, auditContext) {
        if (!ALLOWED_ROLES_SET.has(rol)) {
            throw { status: 400, message: `rol inválido: ${rol}` };
        }
        const before = await this.userModel.findById(id);
        if (!before) throw { status: 404, message: `Usuario ${id} no encontrado` };
        const updated = await this.userModel.updateRole(id, rol);
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'AUTH',
                entidad_id: id,
                accion: 'SECURITY_ROLE_CHANGE',
                payload_before: before,
                payload_after: updated,
                metadata: { rol_anterior: before?.rol ?? null, rol_nuevo: rol }
            })
        );
        return updated;
    }

    // Reset password for a user and log the action.
    async resetPassword(id, newPassword, actor, auditContext) {
        if (!newPassword) throw { status: 400, message: 'password es requerido' };
        const before = await this.userModel.findById(id);
        if (!before) throw { status: 404, message: `Usuario ${id} no encontrado` };
        const passwordHash = await HashUtil.hashPassword(newPassword);
        const updated = await this.userModel.updatePassword(id, passwordHash);
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'AUTH',
                entidad_id: id,
                accion: 'SECURITY_PASSWORD_RESET',
                payload_before: before,
                payload_after: updated
            })
        );
        return updated;
    }
}

export default UserService;
