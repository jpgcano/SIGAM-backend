# SIGAM-backend

Backend SIGAM con **Express + PostgreSQL**, estructura en capas y enfoque de **programación orientada a objetos** (Models, Services, Controllers).

## Variables de entorno

Configura un archivo `.env` con:

```env
PORT=4000
JWT_SECRET=tu_secreto_jwt
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sigam
DB_SSL=false
```

## Scripts SQL separados

1. `sql/00_migration_add_password.sql` → agrega `password_hash` en tablas existentes.
2. `sql/01_schema.sql` → crea el esquema completo.
3. `sql/02_seed_data.sql` → carga datos de prueba.
4. `sql/03_views.sql` → crea vistas de operación.
5. `sql/04_triggers.sql` → crea funciones y disparadores.

### Orden recomendado (ambiente nuevo)

```sql
\i sql/01_schema.sql
\i sql/03_views.sql
\i sql/04_triggers.sql
\i sql/02_seed_data.sql
```

### Orden recomendado (ambiente existente)

```sql
\i sql/00_migration_add_password.sql
\i sql/03_views.sql
\i sql/04_triggers.sql
```

## Endpoints base

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/admin-panel`
- `GET /api/auth/configuracion`
- `GET /api/auth/perfil`
- `GET /api/users`
- `POST /api/users`
- `GET /api/assets`
- `POST /api/assets`
- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/maintenance`
- `POST /api/maintenance`

## Ejecutar

```bash
npm install
npm run dev
```
