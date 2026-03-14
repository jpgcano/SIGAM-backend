# Plan IA - SIGAM Backend

## Objetivo
Asegurar que la automatizacion IA del backend SIGAM opere de forma controlada, trazable y alineada con los flujos de tickets, manteniendo compatibilidad con el sistema existente.

## Alcance
- Solo backend (Node.js, Express, PostgreSQL).
- Enfocado en tickets: clasificacion, prioridad, asignacion automatica y sugerencias.
- No cubre frontend ni despliegue.

## Reglas y Flags de Activacion
- Variables de entorno:
  - `IA_ENABLED=true|false` (habilita/deshabilita IA en general).
  - `IA_ASSIGNMENT_ENABLED=true|false` (habilita asignacion automatica de tecnico).
  - `IA_SUGGESTIONS_ENABLED=true|false` (habilita sugerencias de soluciones).
  - `IA_PROVIDER=rules|openai` (proveedor de clasificacion).
  - `OPENAI_API_KEY` (solo si IA_PROVIDER=openai).
- Si `IA_ENABLED=false`, el sistema debe comportarse de forma determinista (sin IA externa).

## Contratos Funcionales
1. **Creacion de ticket**
   - Al crear un ticket, el sistema clasifica (categoria) y define prioridad.
   - Si `IA_ASSIGNMENT_ENABLED=true` y hay tecnicos disponibles, debe asignar automaticamente al tecnico con menor carga.
   - Se debe mantener compatibilidad con `clasificacion_nlp` y `id_categoria_ticket`.

2. **Sugerencias al consultar ticket**
   - Al solicitar sugerencias, el sistema debe generar un listado basado en historico de tickets similares.
   - Si `IA_SUGGESTIONS_ENABLED=true`, se utiliza el motor de sugerencias local (o IA externa si aplica).

3. **Reprocesamiento y preventivos**
   - Jobs IA deben registrar auditoria y no romper integridad referencial.
   - Las categorias usadas deben existir en `categorias_ticket`.

## Datos y Seguridad
- Nunca guardar prompts o datos sensibles sin anonimizar.
- No exponer credenciales ni tokens en logs.
- Todas las acciones IA deben registrar auditoria en `audit_log`.

## Criterios de Aceptacion
- Crear ticket con IA activa debe:
  - asignar categoria/prioridad.
  - asignar tecnico automaticamente si hay disponibilidad.
  - registrar historial y auditoria.
- Consultar sugerencias debe devolver lista consistente (aunque vacia) sin error.
- Tests deben cubrir al menos:
  - asignacion automatica en create.
  - sugerencias para ticket.
  - job IA-7 preventivo sin acceso a DB real (stubs).

