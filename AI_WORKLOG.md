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
  - a53b46a - Add Vercel config using app.js handler

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

### 2026-03-11 - IA: Codex GPT-5
- Issue: Configuracion Vercel (handler serverless)
- Rama: feature/vercel-config
- Objetivo: ajustar despliegue en Vercel para usar `src/app.js` como handler.
- Cambios:
  - `vercel.json` - configuracion de build y routes apuntando a `src/app.js`.
  - `README.md` - seccion de deploy en Vercel documentada.
- Decisiones tecnicas: usar `src/app.js` directamente por exportar `app` y evitar `listen` en serverless.
- Pendiente: N/A
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual de `vercel.json` y `README.md`.
- Commit(s):
  - N/A

### 2026-03-11 - IA: Codex GPT-5
- Issue: Actualizacion Postman con pruebas y usuarios
- Rama: feature/vercel-config
- Objetivo: completar coleccion Postman con todos los endpoints y pruebas base, incluyendo flujo de registro/login.
- Cambios:
  - `postman/SIGAM - J-AXON API.postman_collection.json` - nuevos requests para usuarios por rol, endpoints faltantes y tests basicos por coleccion.
- Decisiones tecnicas: pruebas genericas de status 2xx y JSON a nivel coleccion; tests especificos para registro/login con variables de token.
- Pendiente: N/A
- Riesgos/Bloqueos: los IDs hardcodeados (1) requieren datos existentes en la BD.
- Evidencia:
  - revision manual de la coleccion actualizada.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: Plan IA - DecisionEngine (rules + external) con continuidad
- Rama: N/A
- Objetivo: implementar el “cerebro” (motor de decisiones) con fallback a reglas para clasificación/prioridad de tickets y asignación por carga, usando `API_IA` cuando se habilite proveedor externo.
- Cambios:
  - `src/config/ia.js` - configuración de IA por `ENV` (incluye `API_IA`).
  - `src/services/ia/DecisionEngine.js` - motor de decisiones con fallback.
  - `src/services/ia/providers/RulesProvider.js` - clasificación/triage por reglas.
  - `src/services/ia/providers/OpenAIProvider.js` - proveedor externo con timeout + circuit breaker (usa `API_IA`).
  - `src/services/ticket.service.js` - integra DecisionEngine en creación de tickets (clasificación + prioridad + asignación opcional).
  - `src/controllers/ticket.controller.js` - pasa `req.user` al servicio al crear ticket.
  - `src/models/Ticket.js` - crea tickets sin bloquear por falta de técnicos; asignación separada; corrección de selección de técnico por carga.
  - `sql/06_migration_ia_metadata.sql` y `sql/01_schema.sql` - metadata opcional para trazabilidad IA (metodo/confidence/rationale).
  - `.env.example` - variables de entorno para IA documentadas.
  - `src/server.js` y `src/config/db.js` - remoción de emojis en logs (regla del repo).
- Decisiones tecnicas:
  - Fallback inmediato a reglas si el proveedor externo falla o excede timeout.
  - Inserción de metadata IA en `tickets` es opcional: si faltan columnas en Supabase, se reintenta sin metadata para no interrumpir.
- Evidencia:
  - Revisión manual de flujos: `POST /api/tickets` ahora calcula `clasificacion_nlp` y `prioridad_ia` y asigna técnico si hay disponibilidad.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: IA-4 Sugerencias (tickets similares)
- Rama: N/A
- Objetivo: exponer sugerencias de solución basadas en historial del activo (keywords + Jaccard) como siguiente módulo en orden.
- Cambios:
  - `src/services/ia/TicketSuggestionEngine.js` - motor de sugerencias (score + matched_keywords).
  - `src/models/Ticket.js` - consultas core del ticket + candidatos resueltos/cerrados por activo.
  - `src/services/ticket.service.js` - método `getSuggestions` integrando el motor.
  - `src/controllers/ticket.controller.js` - handler `getSuggestions` con validación.
  - `src/routes/ticket.routes.js` - endpoint `GET /api/tickets/:id/suggestions` y corrección de strings de roles (Técnico).
- Evidencia:
  - `node --test` OK.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: IA-5 Sugerencia de compra (tendencia de consumo)
- Rama: N/A
- Objetivo: generar sugerencias de compra por repuesto usando consumo histórico y crear alertas sin duplicar.
- Cambios:
  - `src/models/alerta.js` - modelo para crear/evitar alertas duplicadas.
  - `src/models/repuesto.js` - query de consumo por repuesto en ventana de días.
  - `src/services/ia/jobs.service.js` - job IA-5 (proyección stockout + reglas de sugerencia).
  - `src/controllers/iaJobs.controller.js` - controlador para ejecutar job.
  - `src/routes/iaJobs.routes.js` y `src/app.js` - endpoint `POST /api/jobs/ia/repuestos/sugerencias` (roles Analista/Gerente).
  - `test/ia5.purchase-suggestions.test.js` - pruebas unitarias del job.
- Evidencia:
  - `node --test` OK.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: IA-6 Sugerencia de baja por costo acumulado
- Rama: N/A
- Objetivo: sugerir baja de activos si costo de repuestos (ventana) supera % del costo de compra y crear alertas sin duplicar.
- Cambios:
  - `src/models/Asset.js` - agrega `costo_compra` en create/update y query de costo de repuestos por activo.
  - `src/models/alerta.js` - soporte para alertas por `id_activo` (sin duplicados).
  - `src/services/ia/jobs.service.js` - job IA-6 (`generateDisposalSuggestions`) con defaults por `ENV`.
  - `src/controllers/iaJobs.controller.js` y `src/routes/iaJobs.routes.js` - endpoint `POST /api/jobs/ia/activos/baja-sugerida`.
  - `sql/07_migration_ia_asset_cost.sql` y `sql/01_schema.sql` - columna `activos.costo_compra` + constraint.
  - `sql/02_seed_data.sql` - añade `costo_compra` a activos generados.
  - `.env.example` - `IA_DISPOSAL_WINDOW_DAYS` y `IA_DISPOSAL_THRESHOLD_PCT`.
  - `test/ia6.disposal-suggestions.test.js` - pruebas del job.
- Evidencia:
  - `node --test` OK.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: Job externo - reproceso de tickets con IA externa (API_IA)
- Rama: N/A
- Objetivo: permitir recalcular clasificación/prioridad con proveedor externo de IA sin interrumpir el flujo principal, ejecutable como job protegido.
- Cambios:
  - `src/models/Ticket.js` - selección de candidatos (`findTicketsForIaReprocess`) y actualización de campos IA (`updateIaFields` con fallback si faltan columnas en Supabase).
  - `src/services/ia/jobs.service.js` - método `reprocessTicketsExternal` usando `OpenAIProvider` con `API_IA`.
  - `src/controllers/iaJobs.controller.js` y `src/routes/iaJobs.routes.js` - endpoint `POST /api/jobs/ia/tickets/reprocess` (rol `Gerente`).
  - `test/ia.external-reprocess.test.js` - pruebas del job con stubs (sin red).
- Evidencia:
  - `node --test` OK.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: IA-7 Calendarización (mantenimiento preventivo)
- Rama: N/A
- Objetivo: generar MPs vencidos por intervalo, crear ticket + orden y programar `fecha_inicio` con regla básica de ventana (09:00 o 19:00 para criticidad crítica).
- Cambios:
  - `src/models/Asset.js` - candidatos a MP por intervalo (`findPreventiveMaintenanceCandidates`).
  - `src/models/Ticket.js` - evita duplicar MP abierto por activo (`hasOpenPreventiveTicket`).
  - `src/models/Maintenance.js` - update por `id_ticket` (`updateByTicketId`).
  - `src/services/ia/jobs.service.js` - job `generatePreventiveMaintenance` (usa `IA_MP_INTERVAL_DAYS`, `IA_MP_OFFSET_DAYS`).
  - `src/controllers/iaJobs.controller.js` y `src/routes/iaJobs.routes.js` - endpoint `POST /api/jobs/ia/mantenimientos/preventivos` (roles Analista/Gerente).
  - `.env.example` - variables IA-7.
  - `test/ia7.preventive-maintenance.test.js` - pruebas del job.
- Evidencia:
  - `node --test` OK.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: RBAC - endurecer registro público
- Rama: N/A
- Objetivo: evitar escalamiento de privilegios por `POST /api/auth/register` (auto-registro solo como `Usuario` salvo `Gerente` autenticado).
- Cambios:
  - `src/middlewares/optionalAuth.middleware.js` - auth opcional para endpoints públicos.
  - `src/services/auth.service.js` - si actor no es `Gerente`, fuerza `rol='Usuario'` aunque el cliente envíe otro.
  - `src/controllers/auth.controller.js` y `src/routes/auth.routes.js` - `register` acepta actor opcional; `rol` deja de ser required en la ruta.
  - `test/auth.service.test.js` - pruebas ajustadas y caso nuevo para gerente.
- Evidencia:
  - `node --test` OK.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: ISSUE 5 - Unificar matriz RBAC (permissions centralizadas)
- Rama: N/A
- Objetivo: mover permisos a configuración central por recurso/acción y aplicar consistentemente en rutas, incluyendo rol `Auditor`.
- Cambios:
  - `src/config/permissions.js` - matriz RBAC centralizada.
  - `src/middlewares/permit.middleware.js` - middleware `permit(resource, action)`.
  - `src/routes/*.routes.js` - reemplazo de `roleMiddleware([...])` por `permit(...)` en todos los módulos.
  - `test/permit.middleware.test.js` - pruebas del middleware.
- Decisiones tecnicas: normalizar roles (sin tildes / lower) para evitar problemas de encoding y mantener consistencia en checks.
- Evidencia:
  - `node --test` OK.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: Auditoría - sistema de logs (AUDIT_LOG) + endpoints
- Rama: N/A
- Objetivo: registrar movimientos del backend para auditar calidad/seguridad/tiempos de respuesta y habilitar consulta por rol `Auditor`.
- Cambios:
  - `sql/08_migration_audit_log.sql` y `sql/01_schema.sql` - tabla `AUDIT_LOG` + índices.
  - `src/models/auditLog.js` y `src/services/auditLog.service.js` - persistencia + sanitización de secretos + `safeLog`.
  - `src/middlewares/requestContext.middleware.js` - `request_id`, ip, user_agent, start time.
  - `src/middlewares/auditRequest.middleware.js` y `src/app.js` - logging automático de cada request.
  - `src/controllers/auditLog.controller.js` y `src/routes/auditLog.routes.js` - `GET /api/auditoria` y `GET /api/auditoria/:id`.
  - `src/config/permissions.js` - permisos `audit.*` y ampliación de lectura para `Auditor` donde aplica.
  - `test/auditLog.service.test.js` y `test/requestContext.middleware.test.js` - pruebas del sistema de auditoría.
- Evidencia:
  - `node --test` OK.
- Commit(s):
  - N/A

### 2026-03-12 - IA: Codex GPT-5
- Issue: Plan de implementacion para logging de dominio
- Rama: feature/auditoria-rbac-ia
- Objetivo: definir eventos base, pasos de instrumentacion y criterios de cierre para completar la auditoria de dominio.
- Cambios:
  - `README_PLAN_AUDITORIA.md` - agregado plan de implementacion con catalogo de eventos y validacion.
- Decisiones tecnicas: separar logging de request y logging de dominio con convencion `ENTIDAD_ACCION`.
- Pendiente: instrumentar servicios por modulo y agregar tests unitarios por evento base.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual del plan actualizado.
- Commit(s):
  - pendiente

### 2026-03-12 - IA: Codex GPT-5
- Issue: Documentacion de API y limpieza de planes
- Rama: feature/docs-api
- Objetivo: documentar uso de endpoints con request/response y eliminar archivos de planeacion.
- Cambios:
  - `README_FUNCIONAMIENTO_DETALLADO.md` - paso a paso de inicio + endpoints completos.
  - `planIA.md` - eliminado.
  - `README_PLAN_AUDITORIA.md` - eliminado.
- Decisiones tecnicas: documentacion centralizada en el README detallado.
- Pendiente: ejecutar `node --test` si el equipo lo solicita.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual de la documentacion.
- Commit(s):
  - pendiente

### 2026-03-12 - IA: Codex GPT-5
- Issue: Validaciones DB + API para activos y ajuste de tickets
- Rama: feature/auditoria-rbac-ia
- Objetivo: exigir categoria/proveedor en activos (API + DB) y no bloquear creación de tickets por falta de técnico.
- Cambios:
  - `src/services/ticket.service.js` - elimina rechazo cuando no hay técnico disponible.
  - `sql/01_schema.sql` - `id_categoria` y `id_proveedor` como NOT NULL en ACTIVOS.
  - `sql/09_migration_activos_categoria_proveedor_not_null.sql` - migración con validación previa.
- Decisiones tecnicas: regla en DB para evitar nulos y validación temprana en service.
- Pendiente: ejecutar `node --test` si el equipo lo solicita.
- Riesgos/Bloqueos: la migración fallará si hay activos con NULL en esos campos.
- Evidencia:
  - revision manual de schema y migración.
- Commit(s):
  - pendiente

### 2026-03-12 - IA: Codex GPT-5
- Issue: Integracion de cambios feature/SM
- Rama: feature/auditoria-rbac-ia
- Objetivo: exigir id_categoria/id_proveedor en activos y validar disponibilidad de tecnico/analista en tickets.
- Cambios:
  - `src/services/asset.service.js` - validaciones de id_categoria/id_proveedor (cherry-pick).
  - `src/services/ticket.service.js` - rechazar ticket si no hay tecnico/analista (cherry-pick).
  - `test/asset.service.test.js` - ajustes de payload para nuevos campos requeridos.
- Decisiones tecnicas: mantener reglas en service para validacion temprana.
- Pendiente: N/A
- Riesgos/Bloqueos: N/A
- Evidencia:
  - `node --test` OK.
- Commit(s):
  - 9c5780d
  - pendiente (ajuste tests)

### 2026-03-12 - IA: Codex GPT-5
- Issue: Endpoints de seguridad (rol y reset password)
- Rama: feature/auditoria-rbac-ia
- Objetivo: habilitar cambio de rol y reset de contraseña con logs y permisos.
- Cambios:
  - `src/models/User.js` - métodos `updateRole` y `updatePassword`.
  - `src/services/user.service.js` - `updateRole` + `resetPassword` con logs.
  - `src/controllers/user.controller.js` - endpoints para rol y password.
  - `src/routes/user.routes.js` - rutas PATCH `/:id/rol` y `/:id/password`.
  - `src/config/permissions.js` - permisos `users.update_role` y `users.reset_password`.
  - `test/user.service.test.js` y `test/auth.service.test.js` - pruebas de logs de seguridad.
- Decisiones tecnicas: solo `Gerente` puede cambiar rol o resetear password.
- Pendiente: ejecutar `node --test` si el equipo lo solicita.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual de servicios y rutas.
- Commit(s):
  - pendiente

### 2026-03-12 - IA: Codex GPT-5
- Issue: Seguridad adicional + logs de jobs IA
- Rama: feature/auditoria-rbac-ia
- Objetivo: registrar asignaciones de rol privilegiado y ejecuciones/errores de jobs IA.
- Cambios:
  - `src/services/auth.service.js` y `src/services/user.service.js` - log SECURITY_ROLE_ASSIGN.
  - `src/services/ia/jobs.service.js` - logs JOB_IA_RUN/JOB_IA_ERROR por job.
  - `test/auth.service.test.js` y `test/user.service.test.js` - pruebas de role assign.
  - `test/ia.jobs.audit.test.js` - pruebas de logging en IA-5 e IA-6.
- Decisiones tecnicas: logs de jobs IA resumen solo contadores para evitar payloads grandes.
- Pendiente: ejecutar `node --test` si el equipo lo solicita.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual de servicios y tests.
- Commit(s):
  - pendiente

### 2026-03-12 - IA: Codex GPT-5
- Issue: Logging de seguridad (token inválido y acceso denegado)
- Rama: feature/auditoria-rbac-ia
- Objetivo: registrar eventos de seguridad en middleware de auth y autorizacion.
- Cambios:
  - `src/middlewares/verifyToken.middleware.js` - factory con logs AUTH_TOKEN_MISSING/INVALID.
  - `src/middlewares/auth.middleware.js` - usa verifyToken como factory.
  - `src/middlewares/permit.middleware.js` - log SECURITY_ACCESS_DENIED.
  - `test/verifyToken.middleware.test.js` - pruebas de evento token inválido.
  - `test/permit.middleware.test.js` - prueba de auditoria en acceso denegado.
- Decisiones tecnicas: mantener logs de seguridad en middlewares para capturar eventos antes de llegar a controladores.
- Pendiente: ejecutar `node --test` si el equipo lo solicita.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual de middlewares y tests.
- Commit(s):
  - pendiente

### 2026-03-12 - IA: Codex GPT-5
- Issue: Logging inventario - ajustes de stock
- Rama: feature/auditoria-rbac-ia
- Objetivo: registrar ajustes de stock en repuestos.
- Cambios:
  - `src/services/repuesto.service.js` - log adicional REPUESTO_ADJUST cuando cambia stock/stock_minimo.
  - `test/audit.domain.inventory.test.js` - prueba de ajuste de stock.
- Decisiones tecnicas: emitir REPUESTO_UPDATE y REPUESTO_ADJUST cuando hay cambio de stock.
- Pendiente: ejecutar `node --test` si el equipo lo solicita.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual de servicio y test.
- Commit(s):
  - pendiente

### 2026-03-12 - IA: Codex GPT-5
- Issue: Tests de auditoria para eventos secundarios
- Rama: feature/auditoria-rbac-ia
- Objetivo: validar que servicios de licencias/software/proveedores/ubicaciones emiten logs de dominio.
- Cambios:
  - `test/audit.domain.secondary.test.js` - pruebas unitarias para logs de dominio en servicios secundarios.
- Decisiones tecnicas: se usan stubs de modelo y AuditLogService para aislar el comportamiento.
- Pendiente: ejecutar `node --test` si el equipo lo solicita.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual del nuevo test.
- Commit(s):
  - pendiente

### 2026-03-12 - IA: Codex GPT-5
- Issue: Logging de dominio - eventos secundarios
- Rama: feature/auditoria-rbac-ia
- Objetivo: registrar eventos de licencias, software, proveedores y ubicaciones.
- Cambios:
  - `src/services/licencia.service.js` - logs LICENCIA_CREATE/UPDATE/DELETE/ASSIGN/REVOKE.
  - `src/services/software.service.js` - logs SOFTWARE_CREATE/UPDATE/DELETE.
  - `src/services/proveedor.service.js` - servicio corregido y logs PROVEEDOR_CREATE/UPDATE/DELETE.
  - `src/services/ubicacion.service.js` - logs UBICACION_CREATE/UPDATE/DELETE.
  - `src/controllers/licencia.controller.js` - pasar actor/contexto.
  - `src/controllers/software.controller.js` - pasar actor/contexto.
  - `src/controllers/proveedor.controller.js` - pasar actor/contexto.
  - `src/controllers/ubicacion.controller.js` - pasar actor/contexto.
- Decisiones tecnicas: logs emitidos en Services con convencion ENTIDAD_ACCION.
- Pendiente: agregar tests unitarios de auditoria para estos modulos.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual de servicios y controladores actualizados.
- Commit(s):
  - pendiente

### 2026-03-12 - IA: Codex GPT-5
- Issue: Implementacion inicial de logging de dominio
- Rama: feature/auditoria-rbac-ia
- Objetivo: registrar eventos criticos de negocio en servicios (activos, tickets, ordenes, repuestos, usuarios, auth).
- Cambios:
  - `src/services/auditLog.service.js` - helper `buildDomainEntry` para logs de dominio.
  - `src/utils/auditContext.js` - helper para capturar contexto de request.
  - `src/services/asset.service.js` - logs ACTIVO_CREATE/UPDATE/DELETE.
  - `src/services/ticket.service.js` - logs TICKET_CREATE/UPDATE/CLOSE/ASSIGN/DELETE.
  - `src/services/maintenance.service.js` - logs ORDEN_CREATE/UPDATE/DELETE y REPUESTO_CONSUME.
  - `src/services/repuesto.service.js` - logs REPUESTO_CREATE/UPDATE/DELETE.
  - `src/services/auth.service.js` - logs AUTH_LOGIN_SUCCESS/FAIL y USUARIO_CREATE.
  - `src/services/user.service.js` - log USUARIO_CREATE.
  - `src/controllers/*` - paso de actor y contexto de auditoria desde request.
- Decisiones tecnicas: los logs de dominio se emiten en Services para mantener POO por capas.
- Pendiente: agregar cobertura de eventos secundarios (licencias/software/proveedores/ubicaciones) y tests unitarios.
- Riesgos/Bloqueos: N/A
- Evidencia:
  - revision manual de servicios y controladores actualizados.
- Commit(s):
  - pendiente
