class HAGymDateSelectionCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {
      collection_key: "hagym",
      opening_direction: "right",
      vertical_opening_direction: "up",
      default_period: "this_week",
    };
    this._selection = null;
    this._menuOpen = false;
    this._onStorage = this._onStorage.bind(this);
  }

  static getStubConfig() {
    return {
      type: "custom:hagym-date-selection",
      collection_key: "hagym",
      opening_direction: "right",
      vertical_opening_direction: "up",
      default_period: "this_week",
    };
  }

  connectedCallback() {
    window.addEventListener("storage", this._onStorage);
    this._selection = this._loadSelection();
    this._render();
  }

  disconnectedCallback() {
    window.removeEventListener("storage", this._onStorage);
  }

  setConfig(config) {
    const openingDirection =
      config?.opening_direction === "left" ? "left" : "right";
    const verticalDirection =
      config?.vertical_opening_direction === "down" ? "down" : "up";
    const defaultPeriod = this._normalizePeriod(config?.default_period || "this_week");
    this._config = {
      collection_key:
        config?.collection_key && String(config.collection_key).trim()
          ? String(config.collection_key).trim()
          : "hagym",
      opening_direction: openingDirection,
      vertical_opening_direction: verticalDirection,
      default_period: defaultPeriod,
    };
    this._selection = this._loadSelection();
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 2;
  }

  _storageKey() {
    return `hagym-period-selection:${this._config.collection_key}`;
  }

  _onStorage(ev) {
    if (ev.key !== this._storageKey()) return;
    this._selection = this._loadSelection();
    this._render();
  }

  _loadSelection() {
    try {
      const raw = localStorage.getItem(this._storageKey());
      if (!raw) return this._buildSelection(this._config.default_period, new Date());
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return this._buildSelection(this._config.default_period, new Date());
      }
      const periodKey = this._normalizePeriod(parsed.period_key || this._config.default_period);
      const anchor = this._parseDate(parsed.anchor_date) || new Date();
      return this._buildSelection(periodKey, anchor);
    } catch (_err) {
      return this._buildSelection(this._config.default_period, new Date());
    }
  }

  _saveSelection(selection) {
    try {
      localStorage.setItem(this._storageKey(), JSON.stringify(selection));
    } catch (_err) {
      // Ignore storage errors in private modes.
    }
  }

  _emitSelection(selection) {
    const detail = { ...selection, collection_key: this._config.collection_key };
    this.dispatchEvent(
      new CustomEvent("hagym-period-changed", {
        detail,
        bubbles: true,
        composed: true,
      })
    );
    this.dispatchEvent(
      new CustomEvent("hagym-date-selection-changed", {
        detail,
        bubbles: true,
        composed: true,
      })
    );
    window.dispatchEvent(
      new CustomEvent("hagym-period-changed", {
        detail,
      })
    );
    window.dispatchEvent(
      new CustomEvent("hagym-date-selection-changed", {
        detail,
      })
    );
  }

  _setSelection(periodKey, anchorDate) {
    this._selection = this._buildSelection(periodKey, anchorDate);
    this._saveSelection(this._selection);
    this._emitSelection(this._selection);
    this._render();
  }

  _normalizePeriod(value) {
    const valid = new Set([
      "today",
      "yesterday",
      "this_week",
      "this_month",
      "this_quarter",
      "this_year",
      "last_7_days",
      "last_30_days",
      "last_12_weeks",
      "last_12_months",
    ]);
    const normalized = String(value || "").trim().toLowerCase();
    return valid.has(normalized) ? normalized : "this_week";
  }

  _startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  _addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  _addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  _startOfWeek(date) {
    const dayStart = this._startOfDay(date);
    const diff = (dayStart.getDay() + 6) % 7;
    dayStart.setDate(dayStart.getDate() - diff);
    return dayStart;
  }

  _startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  }

  _startOfQuarter(date) {
    const qMonth = Math.floor(date.getMonth() / 3) * 3;
    return new Date(date.getFullYear(), qMonth, 1, 0, 0, 0, 0);
  }

  _startOfYear(date) {
    return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
  }

  _weekLabel(date) {
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
    return `KW ${String(weekNo).padStart(2, "0")} ${tmp.getUTCFullYear()}`;
  }

  _buildSelection(periodKey, anchorDate) {
    const key = this._normalizePeriod(periodKey);
    const anchor = this._parseDate(anchorDate) || new Date();
    let start;
    let end;
    let label;

    if (key === "today") {
      start = this._startOfDay(anchor);
      end = this._addDays(start, 1);
      label = "Heute";
    } else if (key === "yesterday") {
      end = this._startOfDay(anchor);
      start = this._addDays(end, -1);
      label = "Gestern";
    } else if (key === "this_week") {
      start = this._startOfWeek(anchor);
      end = this._addDays(start, 7);
      label = "Diese Woche";
    } else if (key === "this_month") {
      start = this._startOfMonth(anchor);
      end = this._addMonths(start, 1);
      label = "Dieser Monat";
    } else if (key === "this_quarter") {
      start = this._startOfQuarter(anchor);
      end = this._addMonths(start, 3);
      label = "Dieses Quartal";
    } else if (key === "this_year") {
      start = this._startOfYear(anchor);
      end = new Date(start.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
      label = "Dieses Jahr";
    } else if (key === "last_7_days") {
      const todayStart = this._startOfDay(anchor);
      start = this._addDays(todayStart, -6);
      end = this._addDays(todayStart, 1);
      label = "Letzte 7 Tage";
    } else if (key === "last_30_days") {
      const todayStart = this._startOfDay(anchor);
      start = this._addDays(todayStart, -29);
      end = this._addDays(todayStart, 1);
      label = "Letzte 30 Tage";
    } else if (key === "last_12_weeks") {
      const weekStart = this._startOfWeek(anchor);
      start = this._addDays(weekStart, -77);
      end = this._addDays(weekStart, 7);
      label = "Letzte 12 Wochen";
    } else if (key === "last_12_months") {
      const monthStart = this._startOfMonth(anchor);
      start = this._addMonths(monthStart, -11);
      end = this._addMonths(monthStart, 1);
      label = "Letzte 12 Monate";
    } else {
      start = this._startOfWeek(anchor);
      end = this._addDays(start, 7);
      label = "Diese Woche";
    }

    return {
      period_key: key,
      anchor_date: anchor.toISOString(),
      label,
      start: start.toISOString(),
      end: end.toISOString(),
      collection_key: this._config.collection_key,
    };
  }

  _shift(step) {
    const sel = this._selection || this._buildSelection(this._config.default_period, new Date());
    const key = sel.period_key;
    const anchor = this._parseDate(sel.anchor_date) || new Date();
    let nextAnchor = new Date(anchor);

    if (key === "today" || key === "yesterday") {
      nextAnchor = this._addDays(anchor, step);
    } else if (key === "this_week") {
      nextAnchor = this._addDays(anchor, 7 * step);
    } else if (key === "this_month") {
      nextAnchor = this._addMonths(anchor, step);
    } else if (key === "this_quarter") {
      nextAnchor = this._addMonths(anchor, 3 * step);
    } else if (key === "this_year") {
      nextAnchor = this._addMonths(anchor, 12 * step);
    } else if (key === "last_7_days") {
      nextAnchor = this._addDays(anchor, 7 * step);
    } else if (key === "last_30_days") {
      nextAnchor = this._addDays(anchor, 30 * step);
    } else if (key === "last_12_weeks") {
      nextAnchor = this._addDays(anchor, 84 * step);
    } else if (key === "last_12_months") {
      nextAnchor = this._addMonths(anchor, 12 * step);
    }
    this._setSelection(key, nextAnchor);
  }

  _resetNow() {
    const sel = this._selection || this._buildSelection(this._config.default_period, new Date());
    this._setSelection(sel.period_key, new Date());
  }

  _parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  _render() {
    if (!this.shadowRoot) return;
    const sel = this._selection || this._buildSelection(this._config.default_period, new Date());
    const menuPosX =
      this._config.opening_direction === "left" ? "right: 0;" : "left: 0;";
    const menuPosY =
      this._config.vertical_opening_direction === "down"
        ? "top: calc(100% + 8px);"
        : "bottom: calc(100% + 8px);";

    this.shadowRoot.innerHTML = `
      ${this._style()}
      <ha-card>
        <div class="wrap">
          <div class="bar">
            <span class="icon" aria-hidden="true">📅</span>
            <button class="label-btn" data-action="toggle-menu">${this._escape(
              sel.label || "Diese Woche"
            )}</button>
            <button class="ctrl" data-action="prev" title="Zuruck">◀</button>
            <button class="ctrl" data-action="next" title="Weiter">▶</button>
            <button class="now" data-action="now">Jetzt</button>
            <button class="ctrl" data-action="toggle-menu" title="Menu">☰</button>
          </div>
          ${
            this._menuOpen
              ? `<div class="menu" style="${menuPosX}${menuPosY}">
                   ${this._menuButton("today", "Heute")}
                   ${this._menuButton("yesterday", "Gestern")}
                   ${this._menuButton("this_week", "Diese Woche")}
                   ${this._menuButton("this_month", "Dieser Monat")}
                   ${this._menuButton("this_quarter", "Dieses Quartal")}
                   ${this._menuButton("this_year", "Dieses Jahr")}
                   ${this._menuButton("last_7_days", "Letzte 7 Tage")}
                   ${this._menuButton("last_30_days", "Letzte 30 Tage")}
                   ${this._menuButton("last_12_weeks", "Letzte 12 Wochen")}
                   ${this._menuButton("last_12_months", "Letzte 12 Monate")}
                 </div>`
              : ""
          }
        </div>
      </ha-card>
    `;

    this._wireEvents();
  }

  _menuButton(key, label) {
    return `<button data-period="${key}">${this._escape(label)}</button>`;
  }

  _wireEvents() {
    const root = this.shadowRoot;
    if (!root) return;

    root.querySelectorAll('[data-action="toggle-menu"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        this._menuOpen = !this._menuOpen;
        this._render();
      });
    });
    root.querySelector('[data-action="prev"]')?.addEventListener("click", () => {
      this._shift(-1);
    });
    root.querySelector('[data-action="next"]')?.addEventListener("click", () => {
      this._shift(1);
    });
    root.querySelector('[data-action="now"]')?.addEventListener("click", () => {
      this._resetNow();
    });
    root.querySelectorAll("[data-period]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const period = btn.getAttribute("data-period") || "this_week";
        this._menuOpen = false;
        this._setSelection(period, new Date());
      });
    });
  }

  _escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  _style() {
    return `
      <style>
        :host { display:block; }
        ha-card { border-radius: 14px; overflow: visible; }
        .wrap { padding: 8px; position: relative; }
        .bar {
          display:flex; align-items:center; gap:8px;
          background: var(--secondary-background-color, var(--card-background-color));
          border: 1px solid var(--divider-color);
          border-radius: 999px;
          padding: 6px 8px;
        }
        .icon { font-size: 15px; }
        .label-btn, .ctrl, .now, .menu button {
          border: none; background: transparent; color: var(--primary-text-color);
          cursor: pointer;
        }
        .label-btn {
          flex:1; text-align:left; padding:6px 8px; border-radius: 10px; font-weight:600; font-size:13px;
          background: var(--card-background-color);
        }
        .ctrl {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--card-background-color);
        }
        .now {
          padding: 6px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;
          background: var(--primary-color); color: var(--text-primary-color, #fff);
        }
        .menu {
          position: absolute; min-width: 220px; z-index: 20;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.25);
          display: grid;
          padding: 6px;
          gap: 4px;
        }
        .menu button {
          text-align: left; padding: 8px 10px; border-radius: 8px; font-size: 13px;
        }
        .menu button:hover {
          background: var(--secondary-background-color);
        }
      </style>
    `;
  }
}

customElements.define("hagym-date-selection", HAGymDateSelectionCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "hagym-date-selection",
  name: "HAGym Date Selection",
  description: "Reusable Energy-inspired period selector for HAGym cards",
  preview: true,
});
