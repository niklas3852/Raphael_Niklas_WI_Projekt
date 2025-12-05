/**
 * storage-manager.js
 * Zentrale Hilfsfunktionen für die persistente Zwischenspeicherung aller Formular- und Auswahlzustände.
 * Speichert pro Step strukturierte Daten unter einem gemeinsamen localStorage-Key, sodass ein Seitenwechsel oder Reload die Eingaben nicht verliert.
 */
(function () {
    const STORAGE_KEY = 'laFormState';

    /**
     * Liest den kompletten Persistenzzustand aus dem localStorage.
     * Liefert immer ein Objekt zurück, damit Aufrufer nicht auf null prüfen müssen.
     * @returns {Record<string, any>} Gespeicherter Zustand aller Steps.
     */
    function readState() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            return {};
        }
    }

    /**
     * Schreibt den vollständig zusammengeführten Zustand zurück in den localStorage.
     * Dadurch sind Aktualisierungen atomar und ein Reload liest immer den letzten Stand.
     * @param {Record<string, any>} state - Bereits gemergter Zustand.
     */
    function writeState(state) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            /* persist silently to avoid breaking UX */
        }
    }

    /**
     * Gibt die Daten eines bestimmten Steps zurück.
     * @param {string} stepKey - Z. B. "step1" oder "step3".
     * @returns {Record<string, any>} Schrittbezogene Daten.
     */
    function getSection(stepKey) {
        const state = readState();
        return state[stepKey] || {};
    }

    /**
     * Merged neue Daten in einen Step und speichert sie sofort.
     * @param {string} stepKey - Schlüssel des Steps.
     * @param {Record<string, any>} data - Neue Werte, die mit dem vorhandenen Zustand gemischt werden.
     */
    function saveSection(stepKey, data) {
        const state = readState();
        state[stepKey] = { ...(state[stepKey] || {}), ...(data || {}) };
        state.updatedAt = new Date().toISOString();
        writeState(state);
    }

    /**
     * Baut aus allen gespeicherten Steps plus optionalen Overrides einen URLSearchParams-String.
     * So bleiben GET-Parameter als Routing-Grundlage erhalten, auch wenn Werte zusätzlich aus dem Storage stammen.
     * @param {Record<string, Record<string, any>>} overrides - Pro Step überschreibbare Werte (z. B. aktuelle Formeingaben).
     * @returns {URLSearchParams} Vollständige Parameter für die nächste Ziel-URL.
     */
    function buildParams(overrides = {}) {
        const params = new URLSearchParams(window.location.search);
        const state = readState();
        const merged = { ...state.step1, ...state.step2, ...state.step3, ...state.step4 };

        Object.keys(overrides).forEach(section => {
            Object.assign(merged, overrides[section]);
        });

        Object.entries(merged).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            const normalized = Array.isArray(value) ? JSON.stringify(value) : String(value);
            params.set(key, normalized);
        });

        return params;
    }

    /**
     * Aktualisiert die aktuelle URL im Verlauf, ohne die Seite neu zu laden.
     * Damit bleiben GET-Parameter während der Eingabe synchron zum Storage.
     * @param {URLSearchParams} params - Parameter, die in der URL landen sollen.
     */
    function syncUrl(params) {
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }

    /**
     * Löscht den kompletten gespeicherten Zustand. Nützlich für Tests oder Reset-Buttons.
     */
    function clearState() {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            /* ignore */
        }
    }

    window.laStorage = {
        getSection,
        saveSection,
        buildParams,
        syncUrl,
        clearState
    };
})();
