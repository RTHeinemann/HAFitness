"""HA Fitness Tracker coordinator."""
from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant

from .const import STATE_READY, STATE_ACTIVE

_LOGGER = logging.getLogger(__name__)


class HAFitnessCoordinator:
    """Manages runtime state for the HA Fitness integration."""

    def __init__(self, hass: HomeAssistant, display_name: str) -> None:
        self.hass = hass
        self.display_name = display_name
        self._workout_state: str = STATE_READY

    @property
    def workout_state(self) -> str:
        return self._workout_state

    def start_workout(self) -> None:
        """Transition workout state to active."""
        _LOGGER.info("HA Fitness: workout started")
        self._workout_state = STATE_ACTIVE

    def finish_workout(self) -> None:
        """Transition workout state to ready."""
        _LOGGER.info("HA Fitness: workout finished")
        self._workout_state = STATE_READY

    def save_set(
        self,
        exercise: str,
        weight: float,
        reps: int,
        notes: str | None = None,
    ) -> None:
        """Log a completed set."""
        _LOGGER.info(
            "HA Fitness: set logged — exercise=%s weight=%s reps=%s notes=%s",
            exercise,
            weight,
            reps,
            notes,
        )
