# Metric Types (Phase 1)

HAGym Phase 1 extends `set_logs` to support multiple training entry metric types in one table.

## Supported Metric Types

- `strength` (default)
- `bodyweight`
- `duration`
- `distance`
- `cardio`
- `hold`
- `custom`

## Design

- No separate `activity_logs` table is introduced.
- `set_logs.metric_type` controls which fields are relevant.
- Existing strength flows stay backward compatible.

## Storage Model

Strength rows use existing fields:

- `weight`
- `reps`
- `volume = weight * reps`

Non-strength rows can use optional fields:

- `duration_seconds`
- `distance_m`
- `calories`
- `steps`
- `avg_heart_rate`, `max_heart_rate`
- `avg_power_watts`, `max_power_watts`, `avg_speed_mps`
- `load_score`
- `intensity`
- `source`
- `added_weight` (for bodyweight entries)

## Load Score (v1)

- `duration` / `hold`: `duration_seconds / 60`
- `distance`: `duration_seconds / 60` if duration exists, else `distance_m / 1000`
- `cardio`: `(duration_seconds / 60) * intensity_factor`
  - `low=0.8`, `moderate=1.0`, `hard=1.4`, `very_hard=1.8`

## Analytics Compatibility

- Existing volume-based strength analytics remain unchanged.
- Non-strength rows are stored with `volume = 0` and therefore do not inflate kg volume totals.
- PR calculations remain strength-focused.

## Service

Use `ha_fitness.save_activity` for non-strength entries.

Use existing strength services for strength logging:

- `ha_fitness.save_current_set`
- `ha_fitness.save_set`
- `ha_fitness.add_set_to_workout`

## Examples

Jogging:

```yaml
service: ha_fitness.save_activity
data:
  exercise_id: running
  metric_type: cardio
  duration_seconds: 1800
  distance_m: 5000
  avg_heart_rate: 145
  max_heart_rate: 172
  calories: 380
  intensity: moderate
  notes: "Locker gelaufen"
```

Plank:

```yaml
service: ha_fitness.save_activity
data:
  exercise_id: plank
  metric_type: hold
  duration_seconds: 90
  notes: "Sauber gehalten"
```

Stretching:

```yaml
service: ha_fitness.save_activity
data:
  exercise_id: stretching
  metric_type: duration
  duration_seconds: 600
```
