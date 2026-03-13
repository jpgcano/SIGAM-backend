import AuditLogService from './auditLog.service.js';

class MaintenanceService {
    constructor(model, auditLogService = new AuditLogService()) {
        this.model = model;
        this.auditLogService = auditLogService;
    }
    static ESTADOS_VALIDOS = new Set(['Abierto', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado']);

    findAll() { return this.model.findAll(); }

    async findById(id) {
        const m = await this.model.findById(id);
        if (!m) throw { status: 404, message: `Orden ${id} no encontrada` };
        return m;
    }

    findByTecnico(id_tecnico) { return this.model.findByTecnico(id_tecnico); }

    create(payload, actor, auditContext) {
        if (!payload.id_ticket) throw { status: 400, message: 'id_ticket es requerido' };
        if (!payload.id_usuario_tecnico) throw { status: 400, message: 'id_usuario_tecnico es requerido' };
        return this.model.create(payload).then((created) => {
            this.auditLogService.safeLog(
                this.auditLogService.buildDomainEntry({
                    actor,
                    context: auditContext,
                    entidad: 'ORDEN',
                    entidad_id: created?.id_orden,
                    accion: 'ORDEN_CREATE',
                    payload_after: created,
                    metadata: { id_ticket: payload.id_ticket }
                })
            );
            return created;
        });
    }

    async update(id, payload, actor, auditContext) {
        const before = await this.model.findById(id);
        const m = await this.model.update(id, payload);
        if (!m) throw { status: 404, message: `Orden ${id} no encontrada` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'ORDEN',
                entidad_id: id,
                accion: 'ORDEN_UPDATE',
                payload_before: before,
                payload_after: m
            })
        );
        return m;
    }

    async remove(id, actor, auditContext) {
        const before = await this.model.findById(id);
        const m = await this.model.remove(id);
        if (!m) throw { status: 404, message: `Orden ${id} no encontrada` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'ORDEN',
                entidad_id: id,
                accion: 'ORDEN_DELETE',
                payload_before: before,
                payload_after: m
            })
        );
        return m;
    }

    // HU-08: Registrar consumo de repuesto
    registrarConsumo(id_orden, payload, actor, auditContext) {
        if (!payload.id_repuesto) throw { status: 400, message: 'id_repuesto es requerido' };
        if (!payload.cantidad_usada) throw { status: 400, message: 'cantidad_usada es requerida' };
        if (payload.cantidad_usada <= 0) throw { status: 400, message: 'cantidad_usada debe ser mayor que 0' };

        const estado_ticket = payload.estado_ticket || 'En Proceso';
        if (!MaintenanceService.ESTADOS_VALIDOS.has(estado_ticket)) {
            throw { status: 400, message: `estado_ticket inválido: ${estado_ticket}` };
        }

        return this.model.registrarConsumo(id_orden, { ...payload, estado_ticket }).then((result) => {
            this.auditLogService.safeLog(
                this.auditLogService.buildDomainEntry({
                    actor,
                    context: auditContext,
                    entidad: 'REPUESTO',
                    entidad_id: payload.id_repuesto,
                    accion: 'REPUESTO_CONSUME',
                    payload_after: result,
                    metadata: {
                        id_orden,
                        id_repuesto: payload.id_repuesto,
                        cantidad_usada: payload.cantidad_usada,
                        estado_ticket
                    }
                })
            );
            return result;
        });
    }

    getConsumos(id_orden) { return this.model.getConsumos(id_orden); }
}

export default MaintenanceService;
