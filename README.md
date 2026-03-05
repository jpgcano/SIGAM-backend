# SIGAM-backend

Scripts SQL separados para SIGAM en `sql/`:

1. `sql/00_migration_add_password.sql` → agrega `password_hash` en tablas existentes.
2. `sql/01_schema.sql` → crea el esquema completo.
3. `sql/02_seed_data.sql` → carga datos de prueba.
4. `sql/03_views.sql` → crea vistas de operación.
5. `sql/04_triggers.sql` → crea funciones y disparadores.

Orden recomendado de ejecución en ambiente nuevo:

```sql
\i sql/01_schema.sql
\i sql/03_views.sql
\i sql/04_triggers.sql
\i sql/02_seed_data.sql
```

Orden recomendado para ambiente existente (si ya existe `USUARIOS` sin password):

```sql
\i sql/00_migration_add_password.sql
\i sql/03_views.sql
\i sql/04_triggers.sql
```
