(function () {
    const ALLOWED_KEYS = [
        "vorname",
        "nachname",
        "matrikel",
        "kurs",
        "studiengang",
        "semester",
        "vertiefung",
        "studiengangsleitung",
        "zeitraum",
        "university",
        "universityId",
        "selectedCourses"
    ];

    function sanitizeParams(params = new URLSearchParams(window.location.search)) {
        const sanitized = new URLSearchParams();
        params.forEach((value, key) => {
            if (ALLOWED_KEYS.includes(key)) {
                sanitized.set(key, value);
            }
        });
        return sanitized;
    }

    function replaceUrl(params) {
        const query = params.toString();
        const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        window.history.replaceState({}, "", nextUrl);
    }

    function getParams() {
        return sanitizeParams();
    }

    function setParams(updates = {}) {
        const params = sanitizeParams();
        Object.entries(updates).forEach(([key, value]) => {
            if (!ALLOWED_KEYS.includes(key)) return;
            if (value === undefined || value === null || value === "") params.delete(key);
            else params.set(key, String(value));
        });
        replaceUrl(params);
        return params;
    }

    function buildUrl(pathname, updates = {}) {
        const params = sanitizeParams();
        Object.entries(updates).forEach(([key, value]) => {
            if (!ALLOWED_KEYS.includes(key)) return;
            if (value === undefined || value === null || value === "") params.delete(key);
            else params.set(key, String(value));
        });
        const query = params.toString();
        return query ? `${pathname}?${query}` : pathname;
    }

    // Entfernt unerwünschte Query-Parameter (z. B. JetBrains Tokens) beim Laden
    replaceUrl(sanitizeParams());

    window.urlState = {
        ALLOWED_KEYS,
        getParams,
        setParams,
        buildUrl
    };
})();
