// filepath: src/back-confirm.js
// Intercept "Zurück" links in navigation buttons and ask for confirmation.
// If confirmed, remove the current step data for the logged-in user (or guest) and then navigate.
(function () {
    function getUserStorageKeyForMatric(matrikel) {
        // Return guest key when no matrikel provided to keep naming consistent with other helpers
        if (!matrikel) return 'la_userdata_guest';
        return 'la_userdata_' + String(matrikel);
    }

    function clearUserStepDataForMatric(matrikel, stepId) {
        try {
            if (!stepId) return;
            // Prefer centralized storageManager API if available
            if (window.storageManager && typeof window.storageManager.resetStep === 'function') {
                try { window.storageManager.resetStep(matrikel, stepId); return; } catch (e) { /* fallback below */ }
            }

            const key = getUserStorageKeyForMatric(matrikel);
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const obj = JSON.parse(raw);
            if (!obj || !obj.steps) return;
            if (Object.prototype.hasOwnProperty.call(obj.steps, stepId)) {
                delete obj.steps[stepId];
                // ensure we write back a sanitized object
                obj.steps = obj.steps || {};
                // if no steps left remove key
                if (!Object.keys(obj.steps).length) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, JSON.stringify(obj));
                }
            }
        } catch (e) {
            console.error('Fehler beim Löschen der Step-Daten', e);
        }
    }

    function extractStepFromHref(rawHref) {
        if (!rawHref) return null;
        try {
            const absolute = new URL(rawHref, window.location.href);
            const match = absolute.pathname.match(/step(\d+)\.html/i);
            return match ? parseInt(match[1], 10) : null;
        } catch (e) {
            return null;
        }
    }

    function handleBackClick(ev) {
        try {
            const target = ev.currentTarget || ev.target;
            const href = (target && target.getAttribute && target.getAttribute('href')) || './index.html';

            // determine current step from body[data-step] or from closest .step-navigation-buttons
            let stepAttr = null;
            if (document.body && document.body.getAttribute) stepAttr = document.body.getAttribute('data-step');
            if (!stepAttr) {
                const nav = target && target.closest && target.closest('.step-navigation-buttons');
                if (nav && nav.getAttribute) stepAttr = nav.getAttribute('data-step');
            }
            const curStepNumber = stepAttr ? parseInt(stepAttr, 10) : null;
            const stepId = curStepNumber ? ('step' + curStepNumber) : null;

            // decide whether this navigation is actually backwards
            const targetStep = extractStepFromHref(href);
            const isBackwards = targetStep && curStepNumber ? targetStep < curStepNumber : !!(target && target.dataset && target.dataset.back !== undefined);
            if (!isBackwards) return; // allow normal navigation for forward/neutral steps

            if (ev && ev.preventDefault) ev.preventDefault();

            const current = (typeof window.getCurrentUser === 'function') ? window.getCurrentUser() : null;
            const matrikel = current && current.matrikelnummer ? current.matrikelnummer : null;

            const msg = 'Wenn du einen Schritt zurück gehst, gehen alle deine Angaben aus dem aktuellen Schritt verloren. Möchtest du wirklich zurück?';
            const confirmed = window.confirm(msg);
            if (!confirmed) return;

            if (stepId) {
                clearUserStepDataForMatric(matrikel, stepId);
                if (stepId === 'step2') {
                    try { window._la_selected_university = null; } catch (e) {}
                }
            }

            setTimeout(() => { window.location.href = href; }, 80);
        } catch (e) {
            console.error('back confirm handler error', e);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        try {
            // select anchor with id=back and elements with .back-btn or button[data-back]
            const backLinks = Array.from(document.querySelectorAll('.step-navigation-buttons a[href], a#back, .back-btn, button[data-back]'));
            const uniqueLinks = Array.from(new Set(backLinks));
            uniqueLinks.forEach(link => {
                link.removeEventListener('click', handleBackClick);
                link.addEventListener('click', handleBackClick);
            });
        } catch (e) {
            // ignore
            console.error('back-confirm init error', e);
        }
    });
})();
