"""SQLite schema migrations for HA Fitness Tracker."""
from __future__ import annotations

from datetime import datetime, timezone
import sqlite3

SCHEMA_VERSION = 1


def apply_migrations(conn: sqlite3.Connection) -> None:
    """Apply all pending schema migrations."""
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL
        )
        """
    )

    row = conn.execute("SELECT MAX(version) AS version FROM schema_migrations").fetchone()
    current_version = int(row["version"] or 0)

    if current_version < 1:
        _apply_v1(conn)


def _apply_v1(conn: sqlite3.Connection) -> None:
    """Create initial workouts and set logs schema."""
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            started_at TEXT NOT NULL,
            finished_at TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS set_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER,
            exercise TEXT NOT NULL,
            weight REAL NOT NULL,
            reps INTEGER NOT NULL,
            volume REAL NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY(workout_id) REFERENCES workouts(id)
        );

        CREATE INDEX IF NOT EXISTS idx_set_logs_exercise_created_at
            ON set_logs(exercise, created_at);
        CREATE INDEX IF NOT EXISTS idx_set_logs_created_at
            ON set_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_set_logs_workout_id
            ON set_logs(workout_id);
        CREATE INDEX IF NOT EXISTS idx_workouts_started_at
            ON workouts(started_at);
        """
    )
    conn.execute(
        "INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES(?, ?)",
        (1, datetime.now(timezone.utc).isoformat()),
    )
