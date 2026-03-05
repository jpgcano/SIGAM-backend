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
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
```

## Instalacion
```bash
pnpm install
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
pnpm dev
```

## Healthcheck
- `GET /health`
