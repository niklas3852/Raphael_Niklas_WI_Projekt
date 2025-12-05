const STATE_FALLBACK = {};

function parseState(raw) {
    if (!raw) return { ...STATE_FALLBACK };
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : { ...STATE_FALLBACK };
    } catch (e) {
        console.warn("Konnte Zustand aus window.name nicht lesen:", e);
        return { ...STATE_FALLBACK };
    }
}

export function loadState() {
    return parseState(window.name);
}

export function saveState(state) {
    window.name = JSON.stringify(state || STATE_FALLBACK);
}

export function updateState(patchOrUpdater) {
    const current = loadState();
    const next = typeof patchOrUpdater === "function"
        ? patchOrUpdater(current)
        : { ...current, ...patchOrUpdater };
    saveState(next);
    return next;
}

export function clearState() {
    window.name = "";
}
