function normalizeRole(role) {
    return String(role || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function roles(...list) {
    return list.map((r) => normalizeRole(r));
}

export const PERMISSIONS = {
    audit: {
        list: roles('Auditor', 'Gerente'),
        read: roles('Auditor', 'Gerente')
    },
    auth: {
        admin_panel: roles('Gerente'),
        configuracion: roles('Técnico', 'Gerente'),
        perfil: roles('Analista', 'Técnico', 'Gerente', 'Usuario', 'Auditor')
    },
    users: {
        list: roles('Gerente', 'Analista', 'Auditor'),
        create: roles('Gerente')
    },
    assets: {
        list: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        read: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        history: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        create: roles('Analista', 'Gerente'),
        update: roles('Analista', 'Gerente'),
        delete: roles('Gerente')
    },
    tickets: {
        list: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        read: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        by_activo: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        assigned_mine: roles('Técnico'),
        metrics: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        suggestions: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        create: roles('Analista', 'Técnico', 'Gerente', 'Usuario'),
        update: roles('Analista', 'Técnico', 'Gerente'),
        change_estado: roles('Analista', 'Técnico', 'Gerente'),
        delete: roles('Gerente')
    },
    maintenance: {
        list: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        read: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        by_tecnico: roles('Analista', 'Técnico', 'Gerente'),
        consumos: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        create: roles('Analista', 'Técnico', 'Gerente'),
        add_consumo: roles('Técnico'),
        update: roles('Analista', 'Técnico', 'Gerente'),
        delete: roles('Gerente')
    },
    metrics: {
        operacion: roles('Analista', 'Gerente', 'Auditor')
    },
    categorias: {
        list: roles('Analista', 'Técnico', 'Gerente', 'Auditor')
    },
    repuestos: {
        list: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        read: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        bajo_stock: roles('Analista', 'Gerente', 'Auditor'),
        create: roles('Analista', 'Gerente'),
        update: roles('Analista', 'Gerente'),
        delete: roles('Gerente')
    },
    proveedores: {
        list: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        read: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        create: roles('Analista', 'Gerente'),
        update: roles('Analista', 'Gerente'),
        delete: roles('Gerente')
    },
    ubicaciones: {
        list: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        read: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        create: roles('Analista', 'Gerente'),
        update: roles('Analista', 'Gerente'),
        delete: roles('Gerente')
    },
    licencias: {
        list: roles('Analista', 'Gerente', 'Auditor'),
        read: roles('Analista', 'Gerente', 'Auditor'),
        asignaciones: roles('Analista', 'Gerente', 'Auditor'),
        create: roles('Analista', 'Gerente'),
        asignar: roles('Analista', 'Gerente'),
        update: roles('Analista', 'Gerente'),
        delete: roles('Gerente'),
        revocar: roles('Analista', 'Gerente')
    },
    software: {
        list: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        read: roles('Analista', 'Técnico', 'Gerente', 'Auditor'),
        create: roles('Analista', 'Gerente'),
        update: roles('Analista', 'Gerente'),
        delete: roles('Gerente')
    },
    ia_jobs: {
        purchase_suggestions: roles('Analista', 'Gerente'),
        disposal_suggestions: roles('Analista', 'Gerente'),
        ticket_reprocess: roles('Gerente'),
        preventive_maintenance: roles('Analista', 'Gerente')
    }
};

export function isRoleAllowed(role, allowedRoles) {
    const r = normalizeRole(role);
    return Array.isArray(allowedRoles) && allowedRoles.includes(r);
}
