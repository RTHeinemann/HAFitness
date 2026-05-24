"""HA Fitness Tracker coordinator."""
from __future__ import annotations

import logging
from collections.abc import Callable

from homeassistant.core import HomeAssistant, callback

from .const import STATE_ACTIVE, STATE_READY

_LOGGER = logging.getLogger(__name__)


class HAFitnessCoordinator:
    """Manages runtime state for the HA Fitness integration."""

    def __init__(self, hass: HomeAssistant, display_name: str) -> None:
        self.hass = hass
        self.display_name = display_name
        self._workout_state: str = STATE_READY
        self._listeners: list[Callable[[], None]] = []

    @property
    def workout_state(self) -> str:
        return self._workout_state

    @callback
    def async_add_listener(self, update_callback: Callable[[], None]) -> Callable[[], None]:
        """Register a listener that is called on state changes. Returns an unsubscribe function."""
        self._listeners.append(update_callback)

        def remove_listener() -> None:
            self._listeners.remove(update_callback)

        return remove_listener

    def _notify_listeners(self) -> None:
        for listener in list(self._listeners):
            listener()

    def start_workout(self) -> None:
        """Transition workout state to active."""
        _LOGGER.info("HA Fitness: workout started")
        self._workout_state = STATE_ACTIVE
        self._notify_listeners()

    def finish_workout(self) -> None:
        """Transition workout state to ready."""
        _LOGGER.info("HA Fitness: workout finished")
        self._workout_state = STATE_READY
        self._notify_listeners()

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
