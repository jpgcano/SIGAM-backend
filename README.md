# SIGAM Backend

Backend de J-AXON (SIGAM), un sistema para gestion de activos TI, tickets de soporte y mantenimiento.

Tecnologias principales:
- Node.js
- Express
- Supabase (PostgreSQL + API)

## Requisitos
- Node.js 20+
- pnpm 10+

## Variables de entorno
Crea un archivo `.env` en la raiz usando esta plantilla exacta:

```env
PORT=4000
JWT_SECRET=coloca_un_secreto_largo
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
```

Reglas importantes:
- Usa solo `SUPABASE_URL` y `SUPABASE_ANON_KEY` para la conexion de datos del backend.
- No uses `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_KEY` en este proyecto.
- No subir `.env` al repositorio (ya esta ignorado en `.gitignore`).
- No pegar claves en commits, issues o pull requests.

## Instalacion
```bash
pnpm install
```

## Base de datos
Para una base nueva (en SQL editor/psql):

```sql
\i sql/01_schema.sql
\i sql/03_views.sql
\i sql/04_triggers.sql
\i sql/02_seed_data.sql
```

Si la base ya existe, aplica migraciones antes de vistas/triggers:

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
- `GET /health` debe responder `200`.
