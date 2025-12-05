(function () {
    const STORAGE_KEY = 'la_wizard_state_v1';

    function safeParse(value) {
        try {
            return value ? JSON.parse(value) : { steps: {} };
        } catch (e) {
            console.warn('Konnte gespeicherte Daten nicht lesen, starte mit leerem Zustand.', e);
            return { steps: {} };
        }
    }

    function loadState() {
        return safeParse(localStorage.getItem(STORAGE_KEY)) || { steps: {} };
    }

    function saveState(state) {
        try {
            const sanitized = state && typeof state === 'object' ? state : { steps: {} };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch (e) {
            console.error('Fehler beim Speichern des Formular-Status', e);
        }
    }

    function mergeStep(state, stepId, payload) {
        if (!stepId) return state;
        const next = { ...(state || {}), steps: { ...(state?.steps || {}) } };
        next.steps[stepId] = { ...(next.steps[stepId] || {}), ...(payload || {}) };
        return next;
    }

    const storageManager = {
        getState() {
            return loadState();
        },
        getStep(stepId) {
            const state = loadState();
            return state.steps?.[stepId] || {};
        },
        setStep(stepId, payload) {
            const state = loadState();
            const next = mergeStep(state, stepId, payload);
            saveState(next);
        },
        resetStep(stepId) {
            const state = loadState();
            if (!state.steps) return;
            if (stepId && state.steps[stepId]) {
                delete state.steps[stepId];
                saveState(state);
            }
        },
        clearAll() {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    window.storageManager = storageManager;
})();
