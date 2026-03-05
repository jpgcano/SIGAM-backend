# AI Worklog

Bitacora obligatoria para registrar el trabajo realizado por IA y evitar duplicidad.

## Reglas de uso
1. Crear una entrada por cada tarea/issue trabajada.
2. Registrar la entrada al finalizar la tarea o al pausar trabajo incompleto.
3. No borrar historial; solo agregar nuevas entradas.
4. Si la tarea queda parcial, completar el campo `Pendiente`.
5. Incluir commit(s) relacionados para trazabilidad.

## Plantilla de entrada

### YYYY-MM-DD - IA: <nombre-modelo>
- Issue: <id/titulo>
- Rama: <branch>
- Objetivo: <alcance puntual>
- Cambios:
  - <archivo 1> - <resumen>
  - <archivo 2> - <resumen>
- Decisiones tecnicas: <supuestos/reglas aplicadas>
- Pendiente: <siguiente paso o N/A>
- Riesgos/Bloqueos: <detalle o N/A>
- Evidencia:
  - <comando/test 1> - <resultado>
  - <comando/test 2> - <resultado>
- Commit(s):
  - <hash corto> - <mensaje>

### 2026-03-05 - IA: Codex GPT-5
- Issue: ISSUE 3 (script SQL MER) + ISSUE 7 (historial automatico de cambios)
- Rama: main
- Objetivo: reforzar base de datos con reglas de negocio, trazabilidad e indices para operacion.
- Cambios:
  - `sql/01_schema.sql` - se agregaron `codigo_qr`, `estado_activo`, constraints de tickets/licencias e indices operativos.
  - `sql/03_views.sql` - se incorporo `codigo_qr` y `estado_activo` en `vw_activos_detalle`.
  - `sql/04_triggers.sql` - triggers para generacion automatica de QR y registro en historial por cambio de estado.
  - `sql/05_migration_db_foundations.sql` - migracion incremental para ambientes existentes.
  - `src/config/db.js` - validacion de conexion actualizada a `SELECT 1 AS ok, NOW() AS now`.
  - `README.md` - se documento el nuevo script de migracion y orden recomendado.
  - `SKILL.md` - se integro justificacion tecnica oficial del proyecto y convenciones backend.
- Decisiones tecnicas: reforzar reglas en base de datos (constraints/triggers) para evitar inconsistencias aunque falle la capa API.
- Pendiente: ejecutar validacion en PostgreSQL real (`psql`) y ajustar si aparece conflicto de datos legacy.
- Riesgos/Bloqueos: los nuevos CHECK pueden fallar en entornos existentes con datos fuera de catalogo.
- Evidencia:
  - `rg --files` - inventario de scripts y estructura actual.
  - revision manual de SQL en archivos actualizados.
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-05 - IA: Codex GPT-5
- Issue: Ajuste de reglas DB + simplificacion README (feedback de equipo)
- Rama: main
- Objetivo: corregir manejo de estado activo/inactivo a boolean y dejar README solo con documentacion y ejecucion.
- Cambios:
  - `sql/01_schema.sql` - `estado_activo` cambiado de texto a `BOOLEAN DEFAULT TRUE`.
  - `sql/05_migration_db_foundations.sql` - conversion segura de `estado_activo` texto -> boolean para entornos existentes.
  - `sql/04_triggers.sql` - historial de cambio de estado adaptado para mostrar Activo/Inactivo desde boolean.
  - `README.md` - contenido reducido a descripcion del proyecto y pasos para correrlo.
- Decisiones tecnicas: estados binarios de operacion (activo/no activo) se modelan como boolean para simplicidad y performance.
- Pendiente: validar migracion en BD real con datos legacy.
- Riesgos/Bloqueos: si existen valores de texto no esperados en `estado_activo`, se convertiran a `FALSE`.
- Evidencia:
  - revision manual de scripts actualizados.
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-05 - IA: Codex GPT-5
- Issue: Politica de ramas y commits
- Rama: feature/database
- Objetivo: formalizar flujo Git del equipo para evitar commits en `main`.
- Cambios:
  - `SKILL.md` - reglas obligatorias de Git: no commit en `main`, base `developer`, ramas por tarea `feature/task`.
  - `SKILL.md` - flujo recomendado actualizado para crear rama desde `developer` antes de implementar.
- Decisiones tecnicas: estandar de ramas obligatorio para trazabilidad y control de integracion.
- Pendiente: socializar la politica con todo el equipo y aplicarla en PR templates si usan GitHub.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision de `SKILL.md` actualizado.
- Commit(s):
  - N/A - pendiente de commit por el equipo.
