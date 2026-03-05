# SIGAM Backend

Backend de J-AXON (SIGAM), un sistema para gestion de activos TI, tickets de soporte y mantenimiento.

Tecnologias principales:
- Node.js
- Express
- PostgreSQL

## Requisitos
- Node.js 20+
- PostgreSQL 14+

## Variables de entorno
Crea un archivo `.env` en la raiz:

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

## Instalacion
```bash
npm install
```

## Base de datos
Para una base nueva, ejecuta en PostgreSQL:

```sql
\i sql/01_schema.sql
\i sql/03_views.sql
\i sql/04_triggers.sql
\i sql/02_seed_data.sql
```

Si ya tienes una base existente, aplica migraciones antes de vistas/triggers:

```sql
\i sql/00_migration_add_password.sql
\i sql/05_migration_db_foundations.sql
\i sql/03_views.sql
\i sql/04_triggers.sql
```

## Ejecutar
```bash
npm run dev
```

## Healthcheck
- `GET /health`
