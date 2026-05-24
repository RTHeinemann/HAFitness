# HA Fitness Storage

## Database Path

HA Fitness stores training data in:

- `/config/ha_fitness/ha_fitness.db`

In integration code this is resolved with:

- `hass.config.path("ha_fitness", "ha_fitness.db")`

## Installation and Runtime Behavior

- HACS installs only integration code in `custom_components/ha_fitness/`.
- The SQLite directory/file is created automatically at runtime.
- The database is **not** stored inside `custom_components/`.

## Persistence Guarantees

- Data survives Home Assistant restarts.
- Data survives HACS integration updates.
- Data usually remains after integration removal/re-install unless manually deleted.

## Backup and Removal

- Include `/config/ha_fitness/ha_fitness.db` in regular Home Assistant backups.
- To fully remove training data, stop Home Assistant and manually delete:
  - `/config/ha_fitness/ha_fitness.db`

## Schema Versioning

- Schema migrations are tracked in `schema_migrations`.
- Current version is applied automatically during startup.

## Recorder and Cloud

- HA Fitness does **not** write directly to Home Assistant recorder DB tables.
- HA Fitness has no cloud storage dependency.
