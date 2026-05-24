"""Config flow for HA Fitness Tracker."""
from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import CONF_DISPLAY_NAME, DEFAULT_DISPLAY_NAME, DOMAIN


class HAFitnessConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for HA Fitness Tracker."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if user_input is not None:
            return self.async_create_entry(
                title=user_input[CONF_DISPLAY_NAME],
                data=user_input,
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_DISPLAY_NAME, default=DEFAULT_DISPLAY_NAME
                    ): str,
                }
            ),
        )
