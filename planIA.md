# Plan IA - SIGAM Backend

## Objetivo
Definir reglas y flags para automatizacion IA en tickets: clasificacion, prioridad, asignacion y sugerencias.

## Alcance
- Solo backend.
- Tickets y mantenimiento preventivo.
- Sin frontend ni despliegue.

## Flags (env)
- `IA_ENABLED=true|false`
- `IA_ASSIGNMENT_ENABLED=true|false`
- `IA_PROVIDER=rules|external`
- `IA_TIMEOUT_MS`
- `API_IA` (si provider externo)
- `IA_MODEL`

## Reglas de negocio
1. **Creacion de ticket**
   - Clasificar categoria y prioridad.
   - Si `IA_ASSIGNMENT_ENABLED=true`, asignar tecnico con menor carga.
2. **Consulta de ticket**
   - Posibilidad de incluir sugerencias de soluciones al consultar el ticket.
3. **Jobs IA**
   - Deben registrar auditoria.
   - No deben romper integridad referencial.

## Seguridad y datos
- No exponer tokens en logs.
- Auditoria obligatoria para acciones IA.

## Criterios de aceptacion
- Ticket creado con IA activa asigna categoria/prioridad y tecnico (si aplica).
- Consulta de ticket puede devolver sugerencias.
- Tests cubren flujo de sugerencias y asignacion.

