import HashUtil from '../utils/hash.js';
import { ALLOWED_ROLES_SET } from '../config/roles.js';
import AuditLogService from './auditLog.service.js';

class UserService {
    constructor(userModel, auditLogService = new AuditLogService()) {
        this.userModel = userModel;
        this.auditLogService = auditLogService;
    }

    async findAll() {
        return this.userModel.findAll();
    }

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
}

export default UserService;
