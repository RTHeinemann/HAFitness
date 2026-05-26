# Services

This document highlights workout-management services added in v1.

## Workout CRUD

- `ha_fitness.create_workout`
  - required: `started_at`
  - optional: `user_id`, `ended_at`, `notes`, `status`
- `ha_fitness.update_workout`
  - required: `workout_id`
  - optional: `started_at`, `ended_at`, `notes`, `status`
- `ha_fitness.delete_workout`
  - required: `workout_id`
  - optional: `delete_sets` (default `true`)

## Set CRUD

- `ha_fitness.add_set_to_workout`
  - required: `workout_id`, `exercise_id`, `weight`, `reps`
  - optional: `user_id`, `equipment_id`, `notes`, `created_at`
- `ha_fitness.update_set`
  - required: `set_id`
  - optional: `equipment_id`, `exercise_id`, `weight`, `reps`, `notes`, `created_at`
- `ha_fitness.delete_set`
  - required: `set_id`

## Validation

- `weight >= 0`
- `reps >= 1`
- `started_at <= ended_at` when both provided
- referenced workout/set/exercise/equipment must exist

All datetime fields use ISO timestamps.
