# Exercise Catalog and Translations

HA Fitness uses a SQLite-backed exercise catalog with stable IDs.

## Why IDs

- IDs are stable keys (for example `bench_press`).
- Display names can be localized without breaking stored history.
- Statistics (PR/volume) are calculated by `exercise_id`.

## Catalog Schema

Table: `exercises`

- `id` (TEXT, primary key)
- `name_en` (TEXT, required)
- `name_de` (TEXT, optional)
- `muscle_group` (TEXT, optional)
- `equipment` (TEXT, optional)
- `enabled` (INTEGER, default `1`)
- `sort_order` (INTEGER, default `0`)
- `created_at` (TEXT, required)

`set_logs` also contains nullable `exercise_id` for backward compatibility.

## Default Exercise IDs

- `bench_press` – Bench Press / Bankdrücken (`chest`)
- `squat` – Squat / Kniebeuge (`legs`)
- `deadlift` – Deadlift / Kreuzheben (`posterior_chain`)
- `shoulder_press` – Shoulder Press / Schulterdrücken (`shoulders`)
- `row` – Row / Rudern (`back`)
- `lat_pulldown` – Lat Pulldown / Latzug (`back`)
- `bicep_curl` – Bicep Curl / Bizepscurls (`biceps`)
- `tricep_pushdown` – Tricep Pushdown / Trizepsdrücken (`triceps`)

## Localized Display Names

- Active exercise select options are loaded from `exercises`.
- German (`de`) uses `name_de` when available, otherwise falls back to `name_en`.
- Other locales currently use `name_en`.

## Add or Manage Custom Exercises

Use services:

- `ha_fitness.add_exercise`
- `ha_fitness.update_exercise`
- `ha_fitness.disable_exercise`
- `ha_fitness.refresh_exercises`

Recommendations:

- Use lowercase underscore IDs (for example `incline_bench_press`).
- Keep IDs stable after creation.
- Use `sort_order` to control select ordering.
- Use `enabled=false` instead of deleting rows to preserve references.

## Backward Compatibility

- Older rows with only `set_logs.exercise` are preserved.
- Migration attempts to backfill `set_logs.exercise_id` for known names.
- Unknown legacy/custom exercise labels remain valid historical records.
