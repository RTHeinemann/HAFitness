# Workout Management

Workout Management v1 adds editable workout history on top of the same `workouts` and `set_logs` tables used by live logging.

## Scope

- View recent workouts (aggregate sensor + OptionsFlow)
- Create manual workouts with start/end timestamps
- Edit workout metadata (`started_at`, `ended_at`, `notes`, `status`)
- Add/edit/delete sets inside existing workouts
- Delete full workouts (sets deleted by default)

## Data Integrity

- Set volume is always recalculated as `weight * reps`.
- Editing or deleting workouts/sets never deletes exercises, equipment, or muscle groups.
- Legacy rows remain intact unless explicitly edited/deleted by user action.

## Recalculation

After each create/update/delete action:

- workout history cache is refreshed
- statistics are recalculated
- weekly analytics and weekly history update automatically

## Sensor

- `sensor.ha_fitness_personal_recent_workouts`
  - one aggregate sensor on main HAGym device
  - exposes workout list with embedded set details via attributes
  - avoids entity explosion (no one-sensor-per-workout)

## Options Flow

Menu: `Trainings verwalten`

- Training anzeigen
- Training erstellen
- Training bearbeiten
- Satz hinzufügen
- Satz bearbeiten
- Satz löschen
- Training löschen

## Start/Finish Confirmation (v1)

Live workout start/finish uses backend two-step confirmation (10 seconds):

- first press/call sets status to `start_confirm` or `finish_confirm`
- second press/call within 10 seconds executes the action
- timeout resets automatically to `ready` (start) or `active` (finish)
- for automations, use `force: true` in `ha_fitness.start_workout` / `ha_fitness.finish_workout`

Status attributes for dashboards:

- `confirmation_action`
- `confirmation_expires_at`
- `confirmation_seconds_remaining`

Example conditional label (template chip/card):

```jinja2
{% set action = state_attr('sensor.ha_fitness_status', 'confirmation_action') %}
{% if action == 'start_workout' %}
Start bestätigen
{% else %}
Training starten
{% endif %}
```
