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

Current schema version: **1**

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

## Behavior

- Database directory and file are created automatically on integration startup.
- Open workouts (`finished_at IS NULL`) are restored after Home Assistant restart.
- Aggregate statistics and recent sets are reloaded from SQLite at startup.
- Service-triggered set saves while inactive create an implicit workout, save one set, and finish it.
