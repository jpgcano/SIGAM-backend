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

### 2026-03-05 - IA: Codex GPT-5
- Issue: Hardening de documentacion de entorno
- Rama: feature/database
- Objetivo: dejar claro como debe ir `.env` para evitar configuraciones incorrectas y filtrado de secretos.
- Cambios:
  - `README.md` - reglas explicitas de variables permitidas y prohibidas para Supabase SDK.
  - `.env.example` - plantilla oficial para que el equipo copie.
- Decisiones tecnicas: unificar en `SUPABASE_URL` + `SUPABASE_ANON_KEY` y eliminar ambiguedad de variables `DB_*`.
- Pendiente: commit/push de este ajuste de documentacion.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - plantilla `.env.example` creada y README actualizado.
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-05 - IA: Codex GPT-5
- Issue: Limpieza de logs y manejo de errores fantasma
- Rama: feature/database
- Objetivo: eliminar emojis de consola y asegurar errores siempre descriptivos.
- Cambios:
  - `src/utils/error.util.js` - utilitario para normalizar codigo y mensaje de errores.
  - `src/server.js` - logs sin emojis + uso de normalizador de errores en arranque.
  - `src/middlewares/error.middleware.js` - respuesta y log de errores estandarizada (`code`, `message`).
  - `SKILL.md` - regla obligatoria: prohibidos emojis en codigo/logs/respuestas.
- Decisiones tecnicas: unificar salida de errores para evitar mensajes vacios y facilitar trazabilidad.
- Pendiente: definir diseño final de log de eventos.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - `node --check` OK en `server.js`, `error.middleware.js` y `error.util.js`.
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-05 - IA: Codex GPT-5
- Issue: Clasificacion de errores esperados vs reales
- Rama: feature/database
- Objetivo: reducir ruido en consola para 4xx esperados (ej. login invalido).
- Cambios:
  - `src/middlewares/error.middleware.js` - `4xx` ahora se loguea como `Solicitud rechazada`; `5xx` como `Error API`.
- Decisiones tecnicas: no tratar errores de negocio/control de acceso como fallos del sistema.
- Pendiente: validacion final del flujo en Postman con login valido/invalido.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - ajuste aplicado al middleware global de errores.
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-09 - IA: Codex GPT-5
- Issue: Listado tickets asignados + cambio de estado + vista detalle
- Rama: developer
- Objetivo: validar implementacion de la HU y completar faltantes con regla de negocio para técnicos.
- Resultado de revision:
  - `Vista detalle`: implementada en `GET /api/tickets/:id`.
  - `Cambio de estado`: existia via `PUT /api/tickets/:id`, pero sin validacion especifica para cierre por técnico asignado.
  - `Listado tickets asignados`: no existia endpoint para técnico autenticado.
- Cambios:
  - `src/routes/ticket.routes.js`
    - agregado `GET /api/tickets/asignados/mis` (rol `Técnico`).
    - agregado `PATCH /api/tickets/:id/estado` para cambio de estado validado.
    - reordenadas rutas para evitar colision de rutas dinamicas con rutas especificas.
  - `src/controllers/ticket.controller.js`
    - agregados `getAssigned` y `changeEstado`.
    - `update` ahora propaga `req.user` al service para validar reglas de estado.
  - `src/services/ticket.service.js`
    - validacion de estados permitidos (`Abierto`, `Asignado`, `En Proceso`, `Resuelto`, `Cerrado`).
    - regla: si un `Técnico` cambia a `Cerrado`, el ticket debe estar asignado al técnico autenticado.
    - endurecimiento de `update` para que no se evada la regla de cierre.
  - `src/models/Ticket.js`
    - agregado `findAssignedByTecnico(id_tecnico)`.
    - agregado `updateEstado(id, estado)`.
    - agregado `isAssignedToTecnico(id_ticket, id_tecnico)`.
- Decisiones tecnicas: mantener `PUT /tickets/:id` por compatibilidad y añadir `PATCH /tickets/:id/estado` como contrato explicito para cambios de estado.
- Evidencia:
  - `node --check` OK en `src/models/Ticket.js`, `src/services/ticket.service.js`, `src/controllers/ticket.controller.js`, `src/routes/ticket.routes.js`.
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-09 - IA: Codex GPT-5
- Issue: Middleware `verifyToken` + `checkRole` y proteccion de rutas criticas
- Rama: feature/jainer
- Objetivo: estandarizar middlewares de autenticacion/autorizacion y asegurar rechazo por rol inadecuado.
- Resultado de revision:
  - Las rutas criticas ya estaban protegidas con autenticacion + rol (excepto `POST /api/auth/login`, que es publica por diseño).
- Cambios:
  - `src/middlewares/verifyToken.middleware.js`
    - middleware dedicado para validar JWT y poblar `req.user`.
  - `src/middlewares/checkRole.middleware.js`
    - middleware dedicado para autorizacion por roles permitidos.
  - `src/middlewares/auth.middleware.js`
    - refactor a alias de compatibilidad que exporta `verifyToken`.
  - `src/middlewares/role.middleware.js`
    - refactor a alias de compatibilidad que exporta `checkRole`.
- Evidencia:
  - `node --check` OK en `verifyToken.middleware.js`, `checkRole.middleware.js`, `auth.middleware.js`, `role.middleware.js`.
  - prueba rapida de autorizacion: `checkRole(['Gerente'])` con usuario rol `Usuario` retorna `403` y no ejecuta `next()`.
- Commit(s):
  - N/A - pendiente de commit por el equipo.

### 2026-03-10 - IA: Codex GPT-5
- Issue: Transaccion SQL consumo + estado ticket + stock
- Rama: feature/jainer3
- Objetivo: registrar consumo de repuesto con actualizacion de estado de ticket y control de stock en una sola operacion.
- Cambios:
  - `src/models/Maintenance.js` - consumo ahora usa funcion SQL transaccional.
  - `src/services/maintenance.service.js` - valida estado_ticket y cantidad; default a En Proceso.
  - `sql/06_migration_ticket_consumo_tx.sql` - funcion SQL para consumo/estado + validacion de constraints.
  - `README.md` - orden de scripts actualizado para incluir la migracion nueva.
- Decisiones tecnicas: encapsular la operacion critica en funcion SQL atomica y mantener el descuento por trigger para evitar stock negativo.
- Pendiente: N/A
- Riesgos/Bloqueos: si la funcion no se despliega en la BD, el endpoint fallara hasta aplicar la migracion.
- Evidencia:
  - revision manual de cambios.
- Commit(s):
  - N/A

### 2026-03-10 - IA: Codex GPT-5
- Issue: Configurar variables entorno para PostgreSQL produccion
- Rama: feature/jainer3
- Objetivo: dejar plantilla y ejemplo de entorno listos para conexion a Postgres en produccion.
- Cambios:
  - `.env` - variables actualizadas para Postgres de produccion con SSL.
  - `.env.example` - plantilla limpia para Postgres de produccion.
  - `README.md` - seccion de entorno actualizada a Postgres de produccion.
- Decisiones tecnicas: priorizar `DB_MODE=postgres` y `DB_SSL=true` para compatibilidad con servicios gestionados.
- Pendiente: reemplazar placeholders por credenciales reales en el entorno de despliegue.
- Riesgos/Bloqueos: si no se cargan credenciales reales, la API no inicia por validacion de entorno.
- Evidencia:
  - revision manual de cambios.
- Commit(s):
  - N/A

### 2026-03-10 - IA: Codex GPT-5
- Issue: Auditoria OWASP / ESLint security scan
- Rama: feature/security-eslint-audit
- Objetivo: generar analisis automatizado con eslint-plugin-security y guardar reporte.
- Cambios:
  - `eslint.config.js` - configuracion base de ESLint con reglas de seguridad.
  - `reports/eslint-security.json` - salida completa del lint.
  - `reports/ESLINT_SECURITY_REPORT.md` - resumen y hallazgos.
- Evidencia:
  - comando: `pnpm exec eslint . -f json -o reports/eslint-security.json`.
- Commit(s):
  - N/A

### 2026-03-10 - IA: Codex GPT-5
- Issue: Hardening OWASP (A01, A05, A09) + re-scan ESLint
- Rama: feature/security-eslint-audit
- Objetivo: restringir superficie de ataque (ownership checks, sanitizacion 5xx, headers y rate limit).
- Cambios:
  - `src/services/ticket.service.js` - control de acceso por ownership para roles Tecnico/Usuario.
  - `src/models/Ticket.js` - verificacion de ownership por usuario reporta.
  - `src/controllers/ticket.controller.js` - pasa usuario al servicio en getById.
  - `src/middlewares/error.middleware.js` - mensajes 5xx sanitizados.
  - `src/app.js` - `helmet` agregado.
  - `src/routes/auth.routes.js` - rate limit en login.
  - `src/config/db.js` - restricciones DML y bloqueo multi-sentencia en SupabaseAdapter.
  - `reports/eslint-security.json` y `reports/ESLINT_SECURITY_REPORT.md` actualizados.
- Evidencia:
  - `pnpm test` OK.
  - `pnpm exec eslint . -f json -o reports/eslint-security.json`.
- Commit(s):
  - N/A
