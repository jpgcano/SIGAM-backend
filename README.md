# SIGAM Backend

Backend de J-AXON (SIGAM), un sistema para gestion de activos TI, tickets de soporte y mantenimiento.

Tecnologias principales:
- Node.js
- Express
- Supabase (PostgreSQL + API)

## Documentacion clave
- `README_PLAN_AUDITORIA.md` (plan de auditoria y logging)

## Requisitos
- Node.js 20+
- pnpm 10+

## Variables de entorno
Crea un archivo `.env` en la raiz usando esta plantilla exacta para Supabase:

```env
PORT=4000
JWT_SECRET=coloca_un_secreto_largo
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

Reglas importantes:
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
\i sql/06_migration_ticket_consumo_tx.sql
\i sql/02_seed_data.sql
```

Si la base ya existe, aplica migraciones antes de vistas/triggers:

```sql
\i sql/00_migration_add_password.sql
\i sql/05_migration_db_foundations.sql
\i sql/06_migration_ticket_consumo_tx.sql
\i sql/03_views.sql
\i sql/04_triggers.sql
```

## Ejecutar
```bash
pnpm dev
```

## Deploy en Vercel
Vercel usa `src/app.js` como handler serverless. El archivo `src/server.js` se mantiene solo para ejecucion local.
La configuracion esta en `vercel.json` en la raiz.

## Healthcheck
- `GET /health` debe responder `200`.
