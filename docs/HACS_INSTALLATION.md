# HACS Installation Guide

## Prerequisites

- [HACS](https://hacs.xyz/) installed in your Home Assistant instance.
- Home Assistant 2024.1.0 or newer.

## Install via HACS Custom Repository

1. Open HACS in your Home Assistant sidebar.
2. Go to **Integrations**.
3. Click the three-dot menu (⋮) in the top-right corner and select **Custom repositories**.
4. Enter the repository URL:
   ```
   https://github.com/RTHeinemann/HAFitness
   ```
   and select **Integration** as the category.
5. Click **Add**.
6. Find **HA Fitness Tracker** in the HACS integration list and click **Download**.
7. Restart Home Assistant.

## Add the Integration

1. Go to **Settings → Devices & Services → Add Integration**.
2. Search for **HA Fitness Tracker**.
3. Enter a display name (default: `HA Fitness Tracker`) and click **Submit**.

## What Gets Created

After setup, Home Assistant will create:

| Entity | Description |
|--------|-------------|
| `sensor.ha_fitness_status` | Current workout state (`ready` / `active`) |
| `button.ha_fitness_start_workout` | Starts a workout session |
| `button.ha_fitness_finish_workout` | Finishes a workout session |

## Available Services

Call these from **Developer Tools → Services**:

| Service | Description |
|---------|-------------|
| `ha_fitness.start_workout` | Transitions status to `active` |
| `ha_fitness.finish_workout` | Transitions status to `ready` |
| `ha_fitness.save_set` | Logs a set (exercise, weight, reps, optional notes) |

### Example: save_set

```yaml
service: ha_fitness.save_set
data:
  exercise: "Bench Press"
  weight: 80
  reps: 10
  notes: "Felt strong today"
```

## Current Limitations

> ⚠️ The integration scaffold is in early stages.
> The YAML packages in `/packages` remain the more feature-complete prototype
> until full native entity migration is complete.
> SQLite storage and full workout history are planned for a future release.

See [MIGRATION_FROM_YAML_TO_INTEGRATION.md](MIGRATION_FROM_YAML_TO_INTEGRATION.md) for the migration roadmap.
