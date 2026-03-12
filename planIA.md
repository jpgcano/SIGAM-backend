# Plan de Implementación de IA (SIGAM / J-AXON)

Este documento define el plan técnico para implementar los módulos de IA/automatización descritos en los SRS (J-AXON / SIGAM). El objetivo es entregar valor incremental sin bloquear el avance del backend.

## 0) Principios y alcance

- **Fuente de verdad**: este repo es **Node.js + Express + PostgreSQL (ESM)**.
- **IA por etapas**: empezar con reglas determinísticas y telemetría; habilitar “modelo” solo cuando haya datos suficientes.
- **Trazabilidad**: toda decisión automática debe guardarse con: `metodo`, `confidence` (si aplica), `rationale` y timestamps.
- **Seguridad**: los módulos de IA no deben exponer datos sensibles; respetan RBAC y auditoría.

## 0.1) “Cerebro” (Motor de Decisiones) para operar sin interrupción

Sí: es posible diseñar un “cerebro” interno para que el sistema funcione **aunque el proveedor de IA falle** o esté deshabilitado. La idea es desacoplar “tomar decisiones” del proveedor (reglas vs modelo) mediante un motor unificado con *fallbacks*.

**Objetivo**
- Garantizar continuidad: el sistema siempre produce un resultado (aunque sea degradado) y nunca bloquea el flujo principal por depender de IA.

**Diseño (patrón recomendado)**
- Crear un **Motor de Decisiones** único (por ejemplo, `DecisionEngine`) con una interfaz estable por capacidad:
  - `classifyTicket(descripcion) -> { categoria, confidence, rationale, metodo }`
  - `triageTicket({ descripcion, categoria, criticidadActivo }) -> { prioridad, rationale, metodo }`
  - `assignTicket({ ticketId, categoria }) -> { assignedTo, rationale, metodo }`
- Implementar **proveedores** por detrás (orden de preferencia configurable):
  1) `rules` (reglas determinísticas, siempre disponible)
  2) `external` (IA externa / API)
  3) `manual` (cola o revisión humana, cuando aplique)

**Reglas de resiliencia (no negociables)**
- Timeouts estrictos por llamada (ej. 1–3s) y **circuit breaker** para el proveedor `external`.
- Si `external` falla (timeout/error/rate limit) => **fallback inmediato a `rules`** sin error al usuario.
- Guardar en BD el `metodo` usado y el motivo del fallback.
- Permitir **reprocesar** luego (job) tickets creados con `rules` cuando `external` vuelva.

**Síncrono vs asíncrono (para no bloquear)**
- Síncrono (request/response): IA-1 (reglas), IA-2 (reglas), IA-3 (asignación simple) si es rápido.
- Asíncrono (jobs): sugerencias IA-4, compras IA-5, baja IA-6, agenda IA-7 y reprocesos con `external`.

## 1) Módulos IA (MVP -> V1)

### Módulo IA-1: Clasificación NLP de tickets (categoría)

**Objetivo**
- Clasificar un ticket desde `descripcion` en una `categoria` (ej: Hardware, Software, Red, Usuario) con un `confidence`.

**MVP (reglas)**
- Clasificación por palabras clave, sin dependencias externas.
- Resultado:
  - `categoria_predicha`
  - `confidence` (0.0–1.0, heurístico)
  - `keywords` detectadas
  - `metodo = rules_v1`

**V1 (opcional, si se aprueba)**
- Integración con proveedor de IA o modelo local.
- Debe poder apagarse por `ENV` y caer a reglas.

**Criterios de aceptación**
- Si el texto no cumple mínimo (longitud / contenido), el backend rechaza la creación o marca “pendiente de información”.
- Si no hay clasificación válida, `categoria = No_Clasificado` y se deriva a cola manual.

---

### Módulo IA-2: Triage y prioridad (SLA) cruzando criticidad del activo

**Objetivo**
- Calcular `prioridad` (Crítica/Alta/Media/Baja o score) considerando:
  - `descripcion` (keywords de riesgo)
  - `categoria` (IA-1)
  - `activo.criticidad` (Alta/Media/Baja)

**MVP (reglas)**
- Tabla de decisión (ejemplo):
  - activo Alta + keyword riesgo (“quemado”, “humo”, “servidor caído”) => Crítica
  - activo Alta + falla funcional => Alta
  - activo Media + falla funcional => Media
  - activo Baja + consulta/usuario => Baja
- Guardar `rationale` (keywords + criticidad).

**Criterios de aceptación**
- No debe degradar la prioridad manual: permitir override por rol autorizado y auditarlo.

---

### Módulo IA-3: Asignación automática por carga (load balancing)

**Objetivo**
- Asignar el ticket al técnico elegible con menor carga.

**MVP**
- Elegibilidad: rol y permisos (y si existe, especialidad por categoría).
- Carga: conteo de tickets abiertos asignados (y opcionalmente MPs en semana).
- Empates: orden por menor asignación reciente.

**Criterios de aceptación**
- Si no hay técnico elegible => `assigned_to = null`, estado `Pendiente_Asignacion` y evento registrado.
- La asignación se registra en auditoría.

---

### Módulo IA-4: Sugerencia de soluciones (base de conocimiento)

**Objetivo**
- Sugerir pasos de resolución basados en tickets previos:
  - últimos N del mismo activo
  - “similares” por keywords/categoría

**MVP**
- Similaridad por intersección de keywords + misma categoría.
- Respuesta: lista de sugerencias con referencia al ticket origen.

**V1**
- Embeddings + búsqueda vectorial (si se incorpora infraestructura).

---

### Módulo IA-5: Sugerencia de compra por tendencia de consumo

**Objetivo**
- Alertar/sugerir compra ~30 días antes del quiebre de stock.

**MVP**
- Consumo histórico por repuesto: promedio móvil 30/60 días.
- Proyección: `stock_actual / consumo_diario_estimado`.
- Regla: si proyección < 30 días o stock < mínimo => alerta.

**Criterios de aceptación**
- La proyección y su explicación quedan guardadas (para auditoría).

---

### Módulo IA-6: Sugerencia de baja por costo acumulado

**Objetivo**
- Sugerir “dar de baja” si costo acumulado de reparación supera umbral configurable (ej. 60%).

**MVP**
- Umbral configurable en tabla maestra.
- Costo acumulado: repuestos consumidos + costos asociados (si aplica).
- Crear alerta cuando se supere el umbral.

---

### Módulo IA-7: Calendarización inteligente (MP + reasignación)

**Objetivo**
- Generar MPs por periodicidad y asignarlos por carga; reagendar ante tickets críticos; respetar ventanas.

**MVP**
- Job semanal: generar MPs vencidos/proximos.
- Asignación: menor carga semanal.
- Ventanas: reglas básicas (horarios permitidos).

## 2) Datos mínimos (campos que deben existir)

> Los nombres exactos se ajustan al esquema real del repo, pero estos conceptos deben existir.

### Tickets
- `id`, `activo_id`, `descripcion`, `estado`, `categoria`, `prioridad`
- `assigned_to` (usuario técnico)
- `clasificacion_metodo`, `clasificacion_confidence`, `clasificacion_rationale` (texto corto)
- `prioridad_metodo`, `prioridad_rationale`
- `created_at`, `updated_at`

### Activos
- `id`, `criticidad`, `estado_salud` (si aplica), `costo_compra`

### Repuestos / Inventario
- `id`, `stock_actual`, `stock_minimo`

### Consumos / Orden de trabajo
- tabla intermedia ticket/orden -> repuesto + cantidad + costo

### Alertas / Sugerencias
- `id`, `tipo` (compra, baja, etc.), `payload`/detalle, `rationale`, `created_at`, `status`

## 3) Endpoints (contrato mínimo sugerido)

> Ajustar al enrutado existente, manteniendo POO por capas (Route -> Controller -> Service -> Model).

- `POST /api/tickets`
  - Crea ticket, ejecuta IA-1 + IA-2 y (si habilitado) IA-3.
- `POST /api/tickets/:id/assign/auto`
  - Reintenta IA-3 (solo roles autorizados).
- `GET /api/tickets/:id/suggestions`
  - Devuelve IA-4 (solo técnico/roles autorizados).
- `POST /api/jobs/ia/repuestos/sugerencias`
  - Dispara IA-5 (preferible como job interno).
- `POST /api/jobs/ia/activos/baja-sugerida`
  - Dispara IA-6 (preferible como job interno).

## 4) Jobs y programación

- IA-5 e IA-6: jobs diarios o semanales.
- IA-7: job semanal para MPs.
- Los jobs deben poder ejecutarse manualmente para pruebas.

## 5) Feature flags (por variables de entorno)

- `IA_ENABLED=true|false` (mata todo el flujo IA).
- `IA_PROVIDER=rules|external` (si se implementa proveedor).
- `IA_ASSIGNMENT_ENABLED=true|false` (IA-3).
- `IA_SUGGESTIONS_ENABLED=true|false` (IA-4).

## 6) Observabilidad y auditoría

- Log estructurado por decisión: ticketId, metodo, confidence, keywords.
- Tablas/eventos de auditoría para: asignación automática, override manual, cambios de prioridad.

## 7) Pruebas mínimas

- Unit tests para:
  - clasificación por keywords (IA-1)
  - tabla de triage (IA-2)
  - selección de técnico por carga (IA-3)
- Tests de integración:
  - `POST /api/tickets` crea ticket con `categoria/prioridad` y asigna cuando hay técnico elegible
  - cierre de ticket descuenta stock en transacción (si se implementa en el mismo sprint)

## 8) Roadmap sugerido por sprints (backend)

1. **Sprint IA-MVP**: IA-1 + IA-2 (reglas), persistencia de `rationale`, endpoints básicos.
2. **Sprint Asignación**: IA-3 + auditoría; fallback manual.
3. **Sprint Conocimiento**: IA-4 (keywords + historial activo).
4. **Sprint Compras/Baja**: IA-5 + IA-6 con jobs y alertas.
5. **Sprint Calendario**: IA-7 (MPs + carga semanal + reglas ventana).
