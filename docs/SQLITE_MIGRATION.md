# SQLite Migration Status

## Objective

Move native integration state from runtime-only memory to SQLite persistence without external services or dependencies.

## Status

✅ Implemented in Phase 2.

## Runtime Database Path

- `/config/ha_fitness/ha_fitness.db`
- Home Assistant path usage: `hass.config.path("ha_fitness", "ha_fitness.db")`

## Schema Versioning

The integration tracks schema versions in `schema_migrations`:

- `version INTEGER PRIMARY KEY`
- `applied_at TEXT NOT NULL`

Current schema version: **3**

## Version 1 Schema

### workouts

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `started_at TEXT NOT NULL`
- `finished_at TEXT`
- `created_at TEXT NOT NULL`

### set_logs

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `workout_id INTEGER`
- `exercise TEXT NOT NULL`
- `weight REAL NOT NULL`
- `reps INTEGER NOT NULL`
- `volume REAL NOT NULL`
- `notes TEXT`
- `created_at TEXT NOT NULL`
- `FOREIGN KEY(workout_id) REFERENCES workouts(id)`

### Indexes

- `idx_set_logs_exercise_created_at`
- `idx_set_logs_created_at`
- `idx_set_logs_workout_id`
- `idx_workouts_started_at`

## Version 2 Schema Additions

- `users` table (`id`, `display_name`, `enabled`, `created_at`)
- `workouts.user_id`
- `set_logs.user_id`
- legacy backfill to `user_id = legacy`

## Version 3 Schema Additions (Exercise Catalog)

- `exercises` table:
  - `id TEXT PRIMARY KEY`
  - `name_en TEXT NOT NULL`
  - `name_de TEXT`
  - `muscle_group TEXT`
  - `equipment TEXT`
  - `enabled INTEGER NOT NULL DEFAULT 1`
  - `sort_order INTEGER DEFAULT 0`
  - `created_at TEXT NOT NULL`
- `set_logs.exercise_id TEXT` (nullable for backward compatibility)
- seeded defaults:
  - `bench_press` / `Bankdrücken` / `chest`
  - `squat` / `Kniebeuge` / `legs`
  - `deadlift` / `Kreuzheben` / `posterior_chain`
  - `shoulder_press` / `Schulterdrücken` / `shoulders`
  - `row` / `Rudern` / `back`
  - `lat_pulldown` / `Latzug` / `back`
  - `bicep_curl` / `Bizepscurls` / `biceps`
  - `tricep_pushdown` / `Trizepsdrücken` / `triceps`

Backfill behavior:

- Existing `set_logs.exercise` values are mapped to `exercise_id` where a known default ID/name match exists.
- Unknown legacy values stay untouched (`exercise_id` remains `NULL`) to avoid data loss.

## Behavior

- Database directory and file are created automatically on integration startup.
- Open workouts (`finished_at IS NULL`) are restored after Home Assistant restart.
- Aggregate statistics and recent sets are reloaded from SQLite at startup.
- Service-triggered set saves while inactive create an implicit workout, save one set, and finish it.
