const STATE_FALLBACK = {};
const STATE_PARAM = "state";

function parseState(raw) {
    if (!raw) return { ...STATE_FALLBACK };
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : { ...STATE_FALLBACK };
    } catch (e) {
        console.warn("Konnte Zustand aus URL nicht lesen:", e);
        return { ...STATE_FALLBACK };
    }
}

function serializeState(state) {
    try {
        return JSON.stringify(state || STATE_FALLBACK);
    } catch (e) {
        console.warn("Konnte Zustand nicht serialisieren:", e);
        return JSON.stringify({ ...STATE_FALLBACK });
    }
}

function writeStateToUrl(state) {
    const url = new URL(window.location.href);
    url.searchParams.set(STATE_PARAM, serializeState(state));
    window.history.replaceState({}, "", url.toString());
}

export function loadState() {
    const params = new URLSearchParams(window.location.search);
    return parseState(params.get(STATE_PARAM));
}

export function saveState(state) {
    const next = state || STATE_FALLBACK;
    writeStateToUrl(next);
    return next;
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
    const url = new URL(window.location.href);
    url.searchParams.delete(STATE_PARAM);
    window.history.replaceState({}, "", url.toString());
}

export function createUrlWithState(targetUrl, stateOverride) {
    const url = new URL(targetUrl, window.location.href);
    const state = stateOverride ?? loadState();
    url.searchParams.set(STATE_PARAM, serializeState(state));
    return url.toString();
}
