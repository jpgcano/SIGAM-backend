# SIGAM Backend - Documento Detallado de Funcionamiento (Maximo Detalle)

Este documento esta pensado para sustentacion y estudio profundo del backend SIGAM. Incluye arquitectura, reglas, endpoints, ejemplos de request/response, flujos y pruebas. No modifica el README principal.

## 1) Proposito del sistema
SIGAM centraliza la gestion de activos TI y su operacion:
- Activos e historial
- Tickets de soporte
- Ordenes de mantenimiento
- Consumo y stock de repuestos
- Licencias de software
- Catalogo de software

La API es REST y se protege con JWT + roles.

## 2) Stack tecnico
- Node.js + Express
- PostgreSQL (local) o Supabase
- JWT para autenticacion
- bcryptjs para hashing

## 3) Estructura del proyecto
- `src/app.js`: middlewares y rutas.
- `src/server.js`: arranque del servidor.
- `src/routes/*.routes.js`: endpoints por recurso.
- `src/controllers/*.controller.js`: capa HTTP.
- `src/services/*.service.js`: reglas de negocio.
- `src/models/*.js`: acceso a DB.
- `src/middlewares/*`: auth, roles, validaciones.
- `sql/*.sql`: esquema, vistas, triggers y seed.
- `postman/*.json`: coleccion de pruebas.

## 4) Seleccion de base de datos
`src/config/db.js` decide por `DB_MODE`:
- `postgres`: usa `pg`.
- `supabase`: usa `@supabase/supabase-js`.

Variables tipicas:
```
PORT=4000
JWT_SECRET=...
DB_MODE=postgres
DB_HOST=...
DB_PORT=5432
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
```

## 5) Seguridad
### 5.1 Autenticacion
- `POST /api/auth/login`
- Si las credenciales son validas -> devuelve `token`.
- El token incluye `{ id, role }`.

### 5.2 Autorizacion
- `authMiddleware`: requiere token.
- `roleMiddleware`: autoriza por rol.

Roles esperados:
- `Analista`
- `Tecnico`
- `Gerente`
- `Usuario`

## 6) Modelo de datos (resumen)
Tablas (ver `sql/01_schema.sql`):
- `USUARIOS`, `UBICACIONES`, `CATEGORIAS`, `PROVEEDORES`, `SOFTWARE`
- `ACTIVOS`, `TICKETS`
- `ORDENES_MANTENIMIENTO`, `REPUESTOS`, `CONSUMO_REPUESTOS`
- `LICENCIAS`, `ASIGNACION_LICENCIAS`
- `HISTORIAL_ACTIVOS`, `ALERTAS`

Vistas (ver `sql/03_views.sql`):
- `vw_activos_detalle`
- `vw_tickets_operacion`
- `vw_repuestos_bajo_stock`
- `vw_licencias_ocupacion`

Triggers (ver `sql/04_triggers.sql`):
- Descuento automatico de stock al registrar consumo.

## 7) Diagrama textual de relaciones
```
USUARIOS (1) --- (N) TICKETS
USUARIOS (1) --- (N) ORDENES_MANTENIMIENTO (tecnico)
ACTIVOS  (1) --- (N) TICKETS
TICKETS  (1) --- (1) ORDENES_MANTENIMIENTO
ORDENES_MANTENIMIENTO (1) --- (N) CONSUMO_REPUESTOS
REPUESTOS (1) --- (N) CONSUMO_REPUESTOS
SOFTWARE (1) --- (N) LICENCIAS
LICENCIAS (1) --- (N) ASIGNACION_LICENCIAS
ACTIVOS (1) --- (N) ASIGNACION_LICENCIAS (opcional)
USUARIOS (1) --- (N) ASIGNACION_LICENCIAS (opcional)
ACTIVOS (1) --- (N) HISTORIAL_ACTIVOS
ACTIVOS (1) --- (0/1) BAJAS_ACTIVOS
```

## 8) Arquitectura interna (flujo)
```
HTTP Request
  -> Route (validacion y roles)
    -> Controller
      -> Service (reglas de negocio)
        -> Model (DB: Postgres o Supabase)
          -> Response JSON
```

## 9) Endpoints por modulo (con ejemplos)

### 9.1 Auth
**Login**
```
POST /api/auth/login
{
  "email": "carlos.ruiz@empresa.com",
  "password": "Admin1234"
}
```
**Response**
```
{
  "token": "...",
  "user": { "id": 3, "nombre": "Carlos Ruiz", "email": "...", "role": "Gerente" }
}
```

### 9.2 Usuarios
- `GET /api/usuarios` (Gerente, Analista)
- `POST /api/usuarios` (Gerente)

**Create**
```
POST /api/usuarios
{
  "nombre": "Ana",
  "email": "ana@sigam.com",
  "password": "Password1",
  "rol": "Analista"
}
```

### 9.3 Ubicaciones
CRUD completo:
- `GET /api/ubicaciones`
- `GET /api/ubicaciones/:id`
- `POST /api/ubicaciones`
- `PUT /api/ubicaciones/:id`
- `DELETE /api/ubicaciones/:id`

**Response ejemplo**
```
{
  "id_ubicacion": 1,
  "sede": "Norte",
  "piso": "Piso 1",
  "sala": "Recepcion"
}
```

### 9.4 Proveedores
CRUD completo:
- `GET /api/proveedores`
- `GET /api/proveedores/:id`
- `POST /api/proveedores`
- `PUT /api/proveedores/:id`
- `DELETE /api/proveedores/:id`

### 9.5 Activos
- `GET /api/activos`
- `GET /api/activos/:id`
- `GET /api/activos/:id/historial`
- `POST /api/activos`
- `PUT /api/activos/:id`
- `DELETE /api/activos/:id`

**Response de activo (vista)**
```
{
  "id_activo": 1,
  "serial": "SN-000001",
  "modelo": "Modelo Generico 5",
  "fecha_compra": "2023-06-10",
  "vida_util": 48,
  "nivel_criticidad": "Media",
  "estado_vida_util": "Vigente",
  "sede": "Norte",
  "sala": "Recepcion",
  "proveedor": "Dell Colombia"
}
```

### 9.6 Tickets
- `GET /api/tickets`
- `GET /api/tickets/:id`
- `GET /api/tickets/activo/:id_activo`
- `GET /api/tickets/asignados/mis`
- `POST /api/tickets`
- `PUT /api/tickets/:id`
- `PATCH /api/tickets/:id/estado`
- `DELETE /api/tickets/:id`
- `GET /api/tickets/metricas`
- `GET /api/tickets/metricas?id_activo=1`

**Regla clave**
Un tecnico solo puede cerrar tickets asignados a el.

**Crear ticket**
```
POST /api/tickets
{
  "id_activo": 1,
  "id_usuario_reporta": 6,
  "descripcion": "Falla de hardware"
}
```

**Response ejemplo**
```
{
  "id_ticket": 41,
  "id_activo": 1,
  "id_usuario_reporta": 6,
  "estado": "Abierto",
  "fecha_creacion": "2026-03-10T10:00:00Z"
}
```

### 9.7 Mantenimientos
- `GET /api/mantenimientos`
- `GET /api/mantenimientos/:id`
- `GET /api/mantenimientos/tecnico/:id_tecnico`
- `POST /api/mantenimientos`
- `PUT /api/mantenimientos/:id`
- `DELETE /api/mantenimientos/:id`
- `GET /api/mantenimientos/:id/consumos`
- `POST /api/mantenimientos/:id/consumos`

**Crear orden**
```
POST /api/mantenimientos
{
  "id_ticket": 10,
  "id_usuario_tecnico": 2,
  "diagnostico": "Revision inicial",
  "fecha_inicio": "2026-03-10T10:00:00Z"
}
```

### 9.8 Repuestos
- `GET /api/repuestos`
- `GET /api/repuestos/:id`
- `GET /api/repuestos/bajo-stock`
- `POST /api/repuestos`
- `PUT /api/repuestos/:id`
- `DELETE /api/repuestos/:id`

**Response ejemplo**
```
{
  "id_repuesto": 1,
  "nombre": "Memoria RAM 16GB DDR4",
  "stock": 50,
  "stock_minimo": 10
}
```

### 9.9 Licencias
- `GET /api/licencias`
- `GET /api/licencias/:id`
- `GET /api/licencias/:id/asignaciones`
- `POST /api/licencias`
- `POST /api/licencias/asignar`
- `PUT /api/licencias/:id`
- `DELETE /api/licencias/asignacion/:id_asignacion`
- `DELETE /api/licencias/:id`

### 9.10 Software
- `GET /api/software`
- `GET /api/software/:id`
- `POST /api/software`
- `PUT /api/software/:id`
- `DELETE /api/software/:id`

## 10) Metricas MTTR y MTBF
- MTTR: promedio de `(fecha_fin - fecha_inicio)` en ordenes de mantenimiento asociadas a tickets `Resuelto` o `Cerrado`.
- MTBF: promedio del tiempo entre tickets `Resuelto` o `Cerrado` por `id_activo`.

Respuesta incluye segundos, horas y dias.

## 11) Flujos completos
### 11.1 Flujo Ticket -> Repuesto
1. Crear ticket.
2. Crear orden de mantenimiento (asignar tecnico).
3. Consultar stock inicial de repuesto.
4. Registrar consumo.
5. Consultar stock final y validar descuento.
6. Cerrar ticket.

### 11.2 Flujo de licencias
1. Crear licencia.
2. Asignar licencia a usuario o activo.
3. Ver asignaciones.
4. Revocar asignacion.

## 12) Errores comunes por ruta
- `401 Unauthorized`: token invalido o no enviado.
- `403 Forbidden`: rol no autorizado.
- `404 Not Found`: recurso inexistente.
- `400 Bad Request`: campos requeridos faltantes o estado invalido.

## 13) Casos de error concretos
- Intentar cerrar ticket con tecnico no asignado -> `403`.
- Enviar estado invalido en tickets -> `400`.
- Crear mantenimiento sin `id_ticket` o `id_usuario_tecnico` -> `400`.
- Registrar consumo sin `id_repuesto` o `cantidad_usada` -> `400`.

## 14) Datos seed (referencia rapida)
- Usuarios: 1..15
  - Tecnico: `id_usuario=2`
  - Gerente: `id_usuario=3`
- Activos: 1..40
- Repuestos: 1..10
- Software: 1..5

## 15) Ejecucion local
```
# con pnpm
pnpm install
pnpm dev

# con npm
npm install
npm run dev
```

## 16) Healthcheck
`GET /health` debe responder `200`.

## 17) Recomendacion de estudio
1. Lee `sql/01_schema.sql` para entidades.
2. Revisa `sql/03_views.sql` para consultas clave.
3. Sigue el flujo Controller -> Service -> Model en un recurso.
4. Ejecuta el flujo Ticket -> Repuesto con Postman.
