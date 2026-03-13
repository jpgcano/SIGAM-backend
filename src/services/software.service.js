import AuditLogService from './auditLog.service.js';

class SoftwareService {
    constructor(model, auditLogService = new AuditLogService()) {
        this.model = model;
        this.auditLogService = auditLogService;
    }

    findAll() { return this.model.findAll(); }

    async findById(id) {
        const s = await this.model.findById(id);
        if (!s) throw { status: 404, message: `Software ${id} no encontrado` };
        return s;
    }

    create(payload, actor, auditContext) {
        if (!payload.nombre) throw { status: 400, message: 'nombre es requerido' };
        return this.model.create(payload).then((created) => {
            this.auditLogService.safeLog(
                this.auditLogService.buildDomainEntry({
                    actor,
                    context: auditContext,
                    entidad: 'SOFTWARE',
                    entidad_id: created?.id_software,
                    accion: 'SOFTWARE_CREATE',
                    payload_after: created
                })
            );
            return created;
        });
    }

    async update(id, payload, actor, auditContext) {
        const before = await this.model.findById(id);
        const s = await this.model.update(id, payload);
        if (!s) throw { status: 404, message: `Software ${id} no encontrado` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'SOFTWARE',
                entidad_id: id,
                accion: 'SOFTWARE_UPDATE',
                payload_before: before,
                payload_after: s
            })
        );
        return s;
    }

    async remove(id, actor, auditContext) {
        const before = await this.model.findById(id);
        const s = await this.model.remove(id);
        if (!s) throw { status: 404, message: `Software ${id} no encontrado` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'SOFTWARE',
                entidad_id: id,
                accion: 'SOFTWARE_DELETE',
                payload_before: before,
                payload_after: s
            })
        );
        return s;
    }
}

export default SoftwareService;
