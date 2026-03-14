# Plan API - SIGAM Backend (RBAC + Endpoints)

## Objetivo
Completar el alcance de la API con permisos claros por rol, endpoints faltantes y validaciones finales, alineado al SRS.

## Roles y permisos (RBAC)
- Roles oficiales: `Usuario`, `Analista`, `Técnico`, `Gerente`, `Auditor`, `Sistema/IA`.
- Reglas base:
  - `Gerente`: todos los permisos.
  - `Analista`: puede crear usuarios con rol `Usuario` o `Técnico`.
  - `Técnico`: puede cambiar contraseña de usuarios con rol `Usuario`.
  - `Usuario`: solo puede cambiar su propia contraseña.

## Bloques de trabajo

### 1) Usuarios y permisos (prioridad alta)
- Endpoints esperados:
  - `POST /api/usuarios` (crear usuario con RBAC).
  - `PATCH /api/usuarios/:id` (editar nombre/email).
  - `PATCH /api/usuarios/:id/rol` (solo Gerente).
  - `PATCH /api/usuarios/:id/password` (reset por Gerente y técnico limitado a usuarios).
  - `PATCH /api/usuarios/:id/estado` (activar/desactivar).
  - `DELETE /api/usuarios/:id` (soft delete - faltante segun requerimiento).
- Reglas:
  - Técnico solo puede cambiar contraseña a usuarios con rol `Usuario`.
  - Usuario solo puede cambiar su propia contraseña.
- Entregables:
  - Ajustes en `src/config/permissions.js`, `src/services/user.service.js`, `src/services/auth.service.js` y controladores.
  - Tests de permisos.

### 2) Tickets e IA
- Crear ticket:
  - Clasificacion automatica.
  - Prioridad automatica.
  - Asignacion automatica si esta habilitada.
- Consultar ticket:
  - Sugerencias automaticas de soluciones.
- Entregables:
  - Validacion de flags en `planIA.md`.
  - Tests de asignacion y sugerencias.

### 3) Inventario y ciclo de vida
- Activos: CRUD + QR + historial + baja segura.
- Licencias: asignacion a usuario/activo.
- Repuestos: consumo y alertas.

### 4) Alertas y reportes
- Alertas por bajo stock.
- Alertas por obsolescencia (>48 meses).
- Metricas MTTR/MTBF.

### 5) Documentacion y pruebas
- Actualizar `README_FUNCIONAMIENTO_DETALLADO.md` con roles y endpoints.
- Suite de tests verde.

## Criterio de cierre
- RBAC aplicado segun reglas.
- Endpoints faltantes implementados.
- Tests passing.
- Documentacion alineada.

