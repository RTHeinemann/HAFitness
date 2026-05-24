# Migration from YAML to Native Integration

This document describes the migration path from the YAML-based prototype
(`/packages`) to the native Home Assistant custom integration (`custom_components/ha_fitness`).

## Current State

| Feature | YAML Packages | Native Integration |
|---------|:---:|:---:|
| Workout status sensor | ✅ | ✅ (scaffold) |
| Start / Finish workout buttons | ✅ | ✅ (scaffold) |
| Save set service | ✅ | ✅ (logs only) |
| Exercise history | ✅ | ❌ planned |
| PR tracking | ✅ | ❌ planned |
| Volume statistics | ✅ | ❌ planned |
| Recovery tracking | ✅ | ❌ planned |
| NFC / QR workflow | ✅ | ❌ planned |
| SQLite persistence | ❌ planned | ❌ planned |
| Config UI (Settings → D&S) | ❌ | ✅ |
| HACS installable | ❌ | ✅ |

## Migration Roadmap

### Phase 2 – Core entity migration
- Migrate set logging from YAML `input_number` helpers to native sensor/history entries.
- Introduce SQLite-backed storage via a custom database helper.
- Implement exercise catalogue as a native data model.

### Phase 3 – History and statistics
- Migrate workout history templates to native sensors.
- Implement PR tracking in the coordinator.
- Migrate weekly/monthly/yearly statistics to native statistics entries.

### Phase 4 – Advanced workflows
- Integrate NFC/QR automation triggers as integration events.
- Multi-user support via multiple config entries.
- Recovery analytics as computed sensors.

## Running Both in Parallel

You can run the YAML packages and the native integration side-by-side during
migration. They use separate entity domains (`fitness_*` for YAML, `ha_fitness_*`
for the integration) and do not interfere with each other.

## Removing YAML Packages

Once all features have been migrated to the native integration, you can safely:

1. Remove the package files from your Home Assistant `packages/` directory.
2. Remove `input_number`, `input_text`, and `input_boolean` helpers created by the packages.
3. Remove any Lovelace cards that reference `fitness_*` entities and replace them with `ha_fitness_*` equivalents.
