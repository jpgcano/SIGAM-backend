import AuditLogService from './auditLog.service.js';

// Service layer for software licenses and assignments.
class LicenciaService {
    constructor(model, auditLogService = new AuditLogService()) {
        this.model = model;
        this.auditLogService = auditLogService;
    }
    // List all licenses.
    findAll() { return this.model.findAll(); }
    // Fetch a license by id and validate existence.
    async findById(id) {
        const r = await this.model.findById(id);
        if (!r) throw { status: 404, message: `Licencia ${id} no encontrada` };
        return r;
    }
    // Create a license and emit audit log entry.
    async create(payload, actor, auditContext) {
        if (!payload.clave_producto) throw { status: 400, message: 'clave_producto es requerido' };
        const created = await this.model.create(payload);
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: created?.id_licencia,
                accion: 'LICENCIA_CREATE',
                payload_after: created
            })
        );
        return created;
    }
    // Update a license and log before/after states.
    async update(id, payload, actor, auditContext) {
        const before = await this.model.findById(id);
        const r = await this.model.update(id, payload);
        if (!r) throw { status: 404, message: `Licencia ${id} no encontrada` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: id,
                accion: 'LICENCIA_UPDATE',
                payload_before: before,
                payload_after: r
            })
        );
        return r;
    }
    // Remove a license record and log deletion.
    async remove(id, actor, auditContext) {
        const before = await this.model.findById(id);
        const r = await this.model.remove(id);
        if (!r) throw { status: 404, message: `Licencia ${id} no encontrada` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: id,
                accion: 'LICENCIA_DELETE',
                payload_before: before,
                payload_after: r
            })
        );
        return r;
    }
    // Assign a license to a user or asset and log the assignment.
    async asignar(payload, actor, auditContext) {
        const assigned = await this.model.asignar(payload);
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: payload?.id_licencia,
                accion: 'LICENCIA_ASSIGN',
                payload_after: assigned,
                metadata: {
                    id_usuario: payload?.id_usuario ?? null,
                    id_activo: payload?.id_activo ?? null
                }
            })
        );
        return assigned;
    }
    // List assignments for a license.
    getAsignaciones(id) { return this.model.getAsignaciones(id); }
    // Revoke a license assignment and log the change.
    async revocarAsignacion(id, actor, auditContext) {
        const r = await this.model.revocarAsignacion(id);
        if (!r) throw { status: 404, message: `Asignación ${id} no encontrada` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: id,
                accion: 'LICENCIA_REVOKE',
                payload_after: r
            })
        );
        return r;
    }
}
export default LicenciaService;
