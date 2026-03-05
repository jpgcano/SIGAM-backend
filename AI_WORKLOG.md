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

### 2026-03-05 - IA: Codex GPT-5
- Issue: Estandar de comandos del proyecto
- Rama: feature/database
- Objetivo: unificar el flujo de trabajo en `pnpm`.
- Cambios:
  - `README.md` - comandos actualizados de `npm` a `pnpm` (`pnpm install`, `pnpm dev`).
- Decisiones tecnicas: se adopta `pnpm` como gestor por preferencia del equipo.
- Pendiente: aplicar el mismo criterio en futuras guias/scripts internos.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - busqueda de referencias `npm` en archivos de documentacion.
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-05 - IA: Codex GPT-5
- Issue: Diagnostico de arranque backend
- Rama: feature/database
- Objetivo: identificar por que `pnpm dev` cae al iniciar.
- Cambios:
  - `src/server.js` - logs de error mejorados para mostrar causas internas de conexion (codigo, host, puerto).
- Decisiones tecnicas: exponer error interno de `pg` en arranque para reducir tiempo de diagnostico.
- Pendiente: ejecutar `pnpm dev` local y validar causa exacta mostrada en consola.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision de `DB_HOST/DB_PORT/DB_USER/DB_NAME` en `.env` (apuntan a `localhost:5432` / `sigam`).
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-05 - IA: Codex GPT-5
- Issue: Limpieza de configuracion Supabase
- Rama: feature/database
- Objetivo: quitar variables que estorban y dejar `.env` enfocado en conexion PostgreSQL de Supabase.
- Cambios:
  - `.env` - eliminadas variables `SUPABASE_*`; configurado solo `PORT`, `JWT_SECRET`, `DB_*` con enfoque Supabase.
- Decisiones tecnicas: backend usa `pg`, por lo que solo deben existir variables `DB_*` para evitar confusiones.
- Pendiente: validar host oficial de conexion de Supabase desde el panel del proyecto.
- Riesgos/Bloqueos: en este entorno la resolucion DNS de host externo puede fallar (`EAI_AGAIN`).
- Evidencia:
  - `pnpm dev` -> error `getaddrinfo EAI_AGAIN db.xhbbmtemnvimgreetycd.supabase.co`.
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-05 - IA: Codex GPT-5
- Issue: Migracion de conexion a Supabase SDK
- Rama: feature/database
- Objetivo: pasar de conexion `pg` (`DB_*`) a estandar `supabase-js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
- Cambios:
  - `src/lib/supabase.js` - cliente supabase y prueba de conexion minima.
  - `src/server.js` - arranque validando API de Supabase.
  - `src/config/env.js` - variables requeridas actualizadas a `SUPABASE_*`.
  - `src/models/User.js` - queries migradas a supabase-js.
  - `src/models/Asset.js` - queries migradas a supabase-js.
  - `src/models/Ticket.js` - queries migradas a supabase-js.
  - `src/models/Maintenance.js` - queries migradas a supabase-js.
  - `README.md` - `.env` documentado con `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
  - `package.json` - dependencia `@supabase/supabase-js`.
- Decisiones tecnicas: seguir el camino SDK de Supabase para evitar configuracion directa de host/puerto en backend.
- Pendiente: instalar dependencias con red habilitada (`pnpm install`) y revalidar `pnpm dev`.
- Riesgos/Bloqueos: el entorno actual no resuelve `registry.npmjs.org` (`EAI_AGAIN`), por lo que no se pudo instalar `@supabase/supabase-js`.
- Evidencia:
  - `pnpm dev` falla con `ERR_MODULE_NOT_FOUND` para `@supabase/supabase-js`.
  - `CI=true pnpm install --no-frozen-lockfile` falla por red (`EAI_AGAIN`).
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-05 - IA: Codex GPT-5
- Issue: Ajuste de healthcheck de Supabase
- Rama: feature/database
- Objetivo: evitar falso negativo en test de conexion por diferencia de codigo PostgREST.
- Cambios:
  - `src/lib/supabase.js` - `testSupabaseConnection()` ahora acepta `PGRST116` y `PGRST205` como conexion valida.
- Decisiones tecnicas: considerar variaciones de codigo de error entre versiones de Supabase/PostgREST.
- Pendiente: reintentar `pnpm dev` y validar `GET /health`.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - log local reporto `PGRST205` para tabla inexistente.
- Commit(s):
  - N/A - pendiente de commit por el equipo.
