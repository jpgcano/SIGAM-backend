import AssetModel from '../models/Asset.js';
import { getIaConfig } from '../config/ia.js';
import DecisionEngine from './ia/DecisionEngine.js';
import TicketSuggestionEngine from './ia/TicketSuggestionEngine.js';
import AuditLogService from './auditLog.service.js';

class TicketService {
    constructor(model, { assetModel, iaConfig, decisionEngine, auditLogService } = {}) {
        this.model = model;
        this.assetModel = assetModel || new AssetModel();
        this.iaConfig = iaConfig || getIaConfig();
        this.decisionEngine = decisionEngine || new DecisionEngine(this.iaConfig);
        this.suggestionEngine = new TicketSuggestionEngine({ maxSuggestions: 3 });
        this.auditLogService = auditLogService || new AuditLogService();
    }
    static ESTADOS_VALIDOS = new Set(['Abierto', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado']);

    findAll() { return this.model.findAll(); }

    async findById(id, user) {
        const t = await this.model.findById(id);
        if (!t) throw { status: 404, message: `Ticket ${id} no encontrado` };
        await this.ensureAccess(id, user);
        return t;
    }

    findByActivo(id_activo) { return this.model.findByActivo(id_activo); }

    findAssignedByTecnico(id_tecnico) { return this.model.findAssignedByTecnico(id_tecnico); }

    async getSuggestions(id_ticket, user) {
        await this.ensureAccess(id_ticket, user);

        const ticket = await this.model.findCoreById(id_ticket);
        if (!ticket) throw { status: 404, message: `Ticket ${id_ticket} no encontrado` };

        const candidates = await this.model.findResolvedCandidatesByActivo({
            id_activo: ticket.id_activo,
            exclude_id_ticket: id_ticket,
            limit: 12
        });

        return {
            id_ticket,
            id_activo: ticket.id_activo,
            suggestions: this.suggestionEngine.suggest({ ticket, candidates })
        };
    }

    async create(payload, user, auditContext) {
        if (!payload.descripcion) throw { status: 400, message: 'descripcion es requerida' };
        if (!payload.id_activo) throw { status: 400, message: 'id_activo es requerido' };
        if (!user?.id) throw { status: 401, message: 'Usuario no autenticado' };

        const activo = await this.assetModel.findById(payload.id_activo);
        if (!activo) throw { status: 404, message: `Activo ${payload.id_activo} no encontrado` };

        if (typeof this.model.findSupportTechnicianWithLeastLoad === 'function') {
            const tecnico = await this.model.findSupportTechnicianWithLeastLoad();
            if (!tecnico) {
                throw { status: 409, message: 'No hay tecnico/analista disponible para asignar el ticket' };
            }
        }

        const criticidadActivo = activo.nivel_criticidad || activo.criticidad || 'Media';

        const clasificacion = await this.decisionEngine.classifyTicket({
            descripcion: payload.descripcion
        });
        const categoria = clasificacion?.categoria ?? null;

        const triage = await this.decisionEngine.triageTicket({
            descripcion: payload.descripcion,
            categoria,
            criticidadActivo
        });

        const prioridad = triage?.prioridad ?? 'Media';

        const normalizedPayload = {
            ...payload,
            id_usuario_reporta: user.id,
            clasificacion_nlp: categoria,
            prioridad_ia: prioridad,
            clasificacion_metodo: clasificacion?.metodo || null,
            clasificacion_confidence: clasificacion?.confidence ?? null,
            clasificacion_rationale: clasificacion?.rationale || null,
            prioridad_metodo: triage?.metodo || null,
            prioridad_rationale: triage?.rationale || null,
            estado: 'Abierto'
        };

        const created = await this.model.create(normalizedPayload);

        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor: user,
                context: auditContext,
                entidad: 'TICKET',
                entidad_id: created?.id_ticket,
                accion: 'TICKET_CREATE',
                payload_after: created,
                metadata: { id_activo: payload.id_activo }
            })
        );

        if (!created?.id_ticket) return created;

        if (!this.iaConfig.enabled || !this.iaConfig.assignmentEnabled) {
            return created;
        }

        if (typeof this.model.findSupportTechnicianWithLeastLoad !== 'function' || typeof this.model.assignToTechnician !== 'function') {
            return created;
        }

        const tecnico = await this.model.findSupportTechnicianWithLeastLoad();
        if (!tecnico) {
            return created;
        }

        await this.model.assignToTechnician(created.id_ticket, tecnico.id_usuario);
        const hydrated = await this.model.findById(created.id_ticket);
        if (!hydrated) return created;
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor: user,
                context: auditContext,
                entidad: 'TICKET',
                entidad_id: created.id_ticket,
                accion: 'TICKET_ASSIGN',
                payload_after: hydrated,
                metadata: { id_usuario_tecnico: tecnico.id_usuario }
            })
        );
        return {
            ...hydrated,
            id_usuario_tecnico: tecnico.id_usuario,
            tecnico_asignado: tecnico.nombre
        };
    }

    async update(id, payload, user, auditContext) {
        await this.ensureAccess(id, user);
        if (payload?.estado !== undefined) {
            await this.changeEstado(id, payload.estado, user, payload?.consumos, auditContext);
            const updateData = { ...payload };
            delete updateData.estado;
            delete updateData.consumos;
            if (Object.keys(updateData).length === 0) {
                const current = await this.model.findById(id);
                if (!current) throw { status: 404, message: `Ticket ${id} no encontrado` };
                return current;
            }
            const before = await this.model.findById(id);
            const updated = await this.model.update(id, updateData);
            if (!updated) throw { status: 404, message: `Ticket ${id} no encontrado` };
            this.auditLogService.safeLog(
                this.auditLogService.buildDomainEntry({
                    actor: user,
                    context: auditContext,
                    entidad: 'TICKET',
                    entidad_id: id,
                    accion: 'TICKET_UPDATE',
                    payload_before: before,
                    payload_after: updated
                })
            );
            return updated;
        }
        const before = typeof this.model.findById === 'function'
            ? await this.model.findById(id)
            : null;
        const t = await this.model.update(id, payload);
        if (!t) throw { status: 404, message: `Ticket ${id} no encontrado` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor: user,
                context: auditContext,
                entidad: 'TICKET',
                entidad_id: id,
                accion: 'TICKET_UPDATE',
                payload_before: before,
                payload_after: t
            })
        );
        return t;
    }

    async changeEstado(id, estado, user, consumos, auditContext) {
        if (!estado) throw { status: 400, message: 'estado es requerido' };
        if (!TicketService.ESTADOS_VALIDOS.has(estado)) {
            throw { status: 400, message: `estado inválido: ${estado}` };
        }

        await this.ensureAccess(id, user);
        const before = typeof this.model.findById === 'function'
            ? await this.model.findById(id)
            : null;

        // Regla de negocio: un técnico solo puede cerrar tickets asignados a él.
        if (user?.role === 'Técnico' && estado === 'Cerrado') {
            const assigned = await this.model.isAssignedToTecnico(id, user.id);
            if (!assigned) {
                throw { status: 403, message: 'El ticket no está asignado a este técnico' };
            }
        }

        if (estado === 'Cerrado' && Array.isArray(consumos) && consumos.length) {
            for (const item of consumos) {
                if (!item?.id_repuesto) {
                    throw { status: 400, message: 'consumos.id_repuesto es requerido' };
                }
                const qty = Number(item.cantidad_usada);
                if (!Number.isFinite(qty) || qty <= 0) {
                    throw { status: 400, message: 'consumos.cantidad_usada debe ser > 0' };
                }
            }
            const closed = await this.model.closeWithConsumos(id, consumos);
            this.auditLogService.safeLog(
                this.auditLogService.buildDomainEntry({
                    actor: user,
                    context: auditContext,
                    entidad: 'TICKET',
                    entidad_id: id,
                    accion: 'TICKET_CLOSE',
                    payload_before: before,
                    payload_after: closed,
                    metadata: { consumos }
                })
            );
            return closed;
        }

        const t = await this.model.updateEstado(id, estado);
        if (!t) throw { status: 404, message: `Ticket ${id} no encontrado` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor: user,
                context: auditContext,
                entidad: 'TICKET',
                entidad_id: id,
                accion: estado === 'Cerrado' ? 'TICKET_CLOSE' : 'TICKET_UPDATE',
                payload_before: before,
                payload_after: t
            })
        );
        return t;
    }

    async remove(id, actor, auditContext) {
        const before = await this.model.findById(id);
        const t = await this.model.remove(id);
        if (!t) throw { status: 404, message: `Ticket ${id} no encontrado` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'TICKET',
                entidad_id: id,
                accion: 'TICKET_DELETE',
                payload_before: before,
                payload_after: t
            })
        );
        return t;
    }

    async ensureAccess(id, user) {
        if (!user?.role) return;
        if (user.role === 'Gerente' || user.role === 'Analista') return;
        if (user.role === 'Técnico') {
            const assigned = await this.model.isAssignedToTecnico(id, user.id);
            if (!assigned) {
                throw { status: 403, message: 'El ticket no está asignado a este técnico' };
            }
            return;
        }
        if (user.role === 'Usuario') {
            const reported = await this.model.isReportedByUser(id, user.id);
            if (!reported) {
                throw { status: 403, message: 'El ticket no pertenece al usuario' };
            }
        }
    }

    async getMetrics({ id_activo } = {}) {
        const m = await this.model.getMetrics({ id_activo });
        const mttrSeconds = Number(m.mttr_seconds) || 0;
        const mtbfSeconds = Number(m.mtbf_seconds) || 0;
        return {
            mttr_seconds: mttrSeconds,
            mttr_horas: mttrSeconds / 3600,
            mttr_dias: mttrSeconds / 86400,
            mtbf_seconds: mtbfSeconds,
            mtbf_horas: mtbfSeconds / 3600,
            mtbf_dias: mtbfSeconds / 86400,
            reparaciones: Number(m.reparaciones) || 0,
            intervalos: Number(m.intervalos) || 0,
            filtro_id_activo: id_activo ?? null
        };
    }
}

export default TicketService;
