(function () {
    const PREFIX = 'la_userdata_';
    const LAST_KEY = 'la_last_matrikel';

    function sanitizeMatriculation(matriculation) {
        return (matriculation || '').toString().trim() || 'guest';
    }

    function getStorageKey(matriculation) {
        return PREFIX + sanitizeMatriculation(matriculation);
    }

    function loadUserData(matriculation) {
        try {
            const key = getStorageKey(matriculation);
            const raw = localStorage.getItem(key);
            if (!raw) return { steps: {} };
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return { steps: {} };
            parsed.steps = parsed.steps || {};
            return parsed;
        } catch (e) {
            console.error('Konnte gespeicherte Benutzerdaten nicht laden', e);
            return { steps: {} };
        }
    }

    function saveUserData(matriculation, data) {
        const key = getStorageKey(matriculation);
        localStorage.setItem(key, JSON.stringify({ steps: {}, ...data }));
        localStorage.setItem(LAST_KEY, sanitizeMatriculation(matriculation));
    }

    const storageManager = {
        getLastMatrikel() {
            return localStorage.getItem(LAST_KEY) || 'guest';
        },
        setLastMatrikel(matriculation) {
            localStorage.setItem(LAST_KEY, sanitizeMatriculation(matriculation));
        },
        getUserData(matriculation) {
            return loadUserData(matriculation);
        },
        getStepData(matriculation, stepId) {
            const data = loadUserData(matriculation);
            return data.steps?.[stepId] || null;
        },
        setStepData(matriculation, stepId, payload) {
            const sanitized = sanitizeMatriculation(matriculation);
            const data = loadUserData(sanitized);
            data.steps = data.steps || {};
            data.steps[stepId] = payload;
            saveUserData(sanitized, data);
        },
        resetStep(matriculation, stepId) {
            const sanitized = sanitizeMatriculation(matriculation);
            const data = loadUserData(sanitized);
            if (!data.steps) return;
            delete data.steps[stepId];
            if (!Object.keys(data.steps).length) {
                localStorage.removeItem(getStorageKey(sanitized));
            } else {
                saveUserData(sanitized, data);
            }
        }
    };

    window.storageManager = storageManager;
})();
