/**
 * cd-select.js
 * Web Component für ein benutzerdefiniertes Dropdown-Menü (<cd-select>).
 * Bietet volle Tastaturnavigation und Accessibility-Support (ARIA).
 */
// Corporate Design Component: <cd-select>

class CdSelect extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._value = '';
    this._placeholder = this.getAttribute('placeholder') || 'Option wählen';

    // gebundene Handler (für removeEventListener robust)
    this._onTriggerClick = this._onTriggerClick.bind(this);
    this._onMenuClick = this._onMenuClick.bind(this);
    this._onTriggerKeydown = this._onTriggerKeydown.bind(this);
    this._onDocClick = this._onDocClick.bind(this);
  }

  // ---------- Public API ----------
  /**
   * Gibt den aktuell ausgewählten Wert zurück.
   * @returns {string} Der Wert der ausgewählten Option.
   */
  get value() {
    return this._value;
  }

  /**
   * Setzt den ausgewählten Wert und aktualisiert die Anzeige.
   * @param {string} v - Der zu setzende Wert.
   */
  set value(v) {
    const li = this._menu?.querySelector(`[data-value="${CSS.escape(v)}"]`);
    if (li) {
      this._select(v, li.textContent.trim());
    }
  }

  /**
   * Wird aufgerufen, wenn das Element in den DOM eingefügt wird.
   * Initialisiert das Rendering, Caching und Event-Binding.
   */
  connectedCallback() {
    this._render();
    this._cacheRefs();
    this._buildMenu();
    this._bind();
  }

  // ---------- Render ----------
  /**
   * Erstellt das Shadow DOM HTML und CSS.
   */
  _render() {
    this._shadow.innerHTML = `
      <style>
        :host { position: relative; display: block; font-family: inherit; color: var(--cd-select-text); width: 100%; }
        button {
          all: unset; box-sizing: border-box; width: 100%; text-align: left;
          padding: var(--cd-select-padding-y, .6rem) var(--space-6, 2rem) var(--cd-select-padding-y, .6rem) var(--cd-select-padding-x, .75rem);
          border: 1px solid var(--cd-select-border);
          border-radius: var(--cd-select-radius);
          background: var(--cd-select-bg);
          box-shadow: var(--cd-select-shadow);
          cursor: pointer; line-height: 1.4; position: relative;
        }
        button::after {
          content: ""; position: absolute; right: .75rem; top: 50%; transform: translateY(-50%);
          width: 1.5rem; height: 1.5rem;
          background: no-repeat center/contain url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='%23111827' viewBox='0 0 24 24'><path d='M7 10l5 5 5-5'/></svg>");
          opacity: .7; pointer-events: none;
        }
        button:focus-visible { outline: none; box-shadow: var(--cd-select-focus); }
        ul {
          position: absolute; left: 0; right: 0; margin-top: .25rem;
          background: var(--cd-select-surface);
          border: 1px solid var(--cd-select-border);
          border-radius: var(--cd-select-radius);
          box-shadow: var(--cd-select-shadow);
          list-style: none; padding: 0;
          max-height: 15rem; overflow-y: auto; z-index: var(--cd-select-z, 10);
          display: none;
        }
        ul[aria-hidden="false"] { display: block; }
        li { padding: .5rem .75rem; cursor: pointer; }
        li:hover, li[aria-selected="true"] { background: var(--color-surface); }
        li[disabled] { color: var(--color-muted); cursor: not-allowed; }
      </style>
      <button type="button" id="trigger" aria-haspopup="listbox" aria-expanded="false">${this._placeholder}</button>
      <ul id="menu" role="listbox" aria-hidden="true"></ul>
      <input type="hidden" id="hiddenInput" name="${this.getAttribute('name')
      || ''}">
    `;
  }

  /**
   * Speichert Referenzen auf wichtige DOM-Elemente im Shadow DOM.
   */
  _cacheRefs() {
    this._trigger = this._shadow.getElementById('trigger');
    this._menu = this._shadow.getElementById('menu');
    this._hiddenInput = this._shadow.getElementById('hiddenInput');
  }

  /**
   * Baut die Dropdown-Liste basierend auf den <cd-option>-Kindelementen auf.
   */
  _buildMenu() {
    const items = [...this.querySelectorAll('cd-option')].map(o => ({
      value: o.getAttribute('value'),
      label: o.textContent.trim(),
      disabled: o.hasAttribute('disabled'),
    }));
    // Light DOM leeren, damit keine Doppelanzeige passiert
    this.innerHTML = '';
    // Einträge erzeugen
    for (const { value, label, disabled } of items) {
      const li = document.createElement('li');
      li.textContent = label;
      li.setAttribute('role', 'option');
      li.dataset.value = value;
      if (disabled) {
        li.setAttribute('disabled', '');
      }
      this._menu.appendChild(li);
    }
  }

  // ---------- Events ----------
  /**
   * Bindet Event-Listener für Interaktionen.
   */
  _bind() {
    this._trigger.addEventListener('click', this._onTriggerClick);
    this._trigger.addEventListener('keydown', this._onTriggerKeydown);
    this._menu.addEventListener('click', this._onMenuClick);
    document.addEventListener('click', this._onDocClick);
  }

  /**
   * Wird aufgerufen, wenn das Element aus dem DOM entfernt wird.
   * Entfernt Event-Listener, um Memory Leaks zu vermeiden.
   */
  disconnectedCallback() {
    // sauber aufräumen
    this._trigger?.removeEventListener('click', this._onTriggerClick);
    this._trigger?.removeEventListener('keydown', this._onTriggerKeydown);
    this._menu?.removeEventListener('click', this._onMenuClick);
    document.removeEventListener('click', this._onDocClick);
  }

  /**
   * Handler für Klicks auf den Trigger-Button (öffnet/schließt das Menü).
   */
  _onTriggerClick() {
    this._isOpen() ? this._close() : this._open();
  }

  /**
   * Handler für Klicks auf Menü-Items.
   * @param {Event} e - Das Klick-Event.
   */
  _onMenuClick(e) {
    const li = e.target.closest('li[role="option"]');
    if (!li || li.hasAttribute('disabled')) {
      return;
    }
    this._select(li.dataset.value, li.textContent.trim());
    this._close();
  }

  /**
   * Handler für Tastatureingaben auf dem Trigger-Button (Pfeiltasten, Enter, Escape).
   * @param {KeyboardEvent} e - Das Tastatur-Event.
   */
  _onTriggerKeydown(e) {
    const items = [...this._menu.querySelectorAll('li')];
    let idx = items.findIndex(li => li.dataset.value === this._value);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._open();
      idx = (idx + 1) % items.length;
      this._highlight(items[idx]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._open();
      idx = (idx - 1 + items.length) % items.length;
      this._highlight(items[idx]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const li = items[idx] || items[0];
      if (li) {
        this._select(li.dataset.value, li.textContent.trim());
        this._close();
      }
    } else if (e.key === 'Escape') {
      this._close();
    }
  }

  /**
   * Schließt das Menü bei Klick außerhalb der Komponente.
   * @param {Event} e - Das Klick-Event.
   */
  _onDocClick(e) {
    if (!this.contains(e.target) && !this._shadow.contains(
      e.target)) {
      this._close();
    }
  }

  // ---------- Open/Close ----------
  /**
   * Öffnet das Dropdown-Menü.
   */
  _open() {
    this._trigger.setAttribute('aria-expanded', 'true');
    this._menu.setAttribute('aria-hidden', 'false');
  }

  /**
   * Schließt das Dropdown-Menü.
   */
  _close() {
    this._trigger.setAttribute('aria-expanded', 'false');
    this._menu.setAttribute('aria-hidden', 'true');
  }

  /**
   * Prüft, ob das Menü geöffnet ist.
   * @returns {boolean} True, wenn geöffnet.
   */
  _isOpen() {
    return this._trigger.getAttribute('aria-expanded') === 'true';
  }

  // ---------- Selection ----------
  /**
   * Hebt ein Listen-Item visuell hervor (für Tastaturnavigation).
   * @param {HTMLElement} item - Das hervorzuhebende Item.
   */
  _highlight(item) {
    this._menu.querySelectorAll('[aria-selected]').forEach(
      el => el.removeAttribute('aria-selected'));
    item?.setAttribute('aria-selected', 'true');
    // Sichtbar scrollen
    item?.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Wählt einen Wert aus und aktualisiert Input und Trigger-Text.
   * @param {string} value - Der ausgewählte Wert.
   * @param {string} label - Der anzuzeigende Text.
   */
  _select(value, label) {
    this._value = value;
    this._hiddenInput.value = value;
    this._trigger.textContent = label;
    this._highlight(
      this._menu.querySelector(`[data-value="${CSS.escape(value)}"]`));
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

customElements.define('cd-select', CdSelect);
