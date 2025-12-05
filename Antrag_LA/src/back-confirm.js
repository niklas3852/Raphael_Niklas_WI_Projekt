// filepath: src/back-confirm.js
// Stellt ein einheitliches, tastaturbedienbares Bestätigungs-Modal für alle Zurück-Aktionen bereit.
// Ziel: Jeder Rückschritt fragt nach, ohne dabei versehentlich Formulardaten zu verlieren.
(function () {
    const MODAL_ID = 'back-confirm-modal';
    let pendingHref = null;
    let pendingStepId = null;
    let lastFocused = null;

    // -------------------------------------------------------------
    // Hilfsfunktionen zum Ermitteln des aktuellen/angepeilten Steps
    // -------------------------------------------------------------
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

    function getCurrentStepId() {
        const stepAttr = document.body?.getAttribute('data-step');
        return stepAttr ? `step${stepAttr}` : null;
    }

    // -------------------------------------------------------------
    // Modal-Baukasten (Aria-konform + Fokussteuerung)
    // -------------------------------------------------------------
    function ensureModalExists() {
        if (document.getElementById(MODAL_ID)) return document.getElementById(MODAL_ID);

        const overlay = document.createElement('div');
        overlay.id = MODAL_ID;
        overlay.className = 'back-modal is-hidden';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'back-modal-title');
        overlay.innerHTML = `
            <div class="back-modal__dialog">
                <div class="back-modal__header">
                    <span id="back-modal-title">Zur vorherigen Seite wechseln?</span>
                </div>
                <p class="back-modal__body" id="back-modal-body">
                    Deine Eingaben bleiben dank Zwischenspeicherung erhalten. Möchtest du trotzdem zurück navigieren?
                </p>
                <div class="back-modal__actions">
                    <button type="button" class="btn back-modal__btn" data-action="cancel">Abbrechen</button>
                    <button type="button" class="btn primary back-modal__btn" data-action="confirm">Ja, zurück</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Tastaturbedienung: ESC schließt das Modal ohne Navigation.
        overlay.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                hideModal();
            }
        });

        overlay.querySelector('[data-action="cancel"]').addEventListener('click', hideModal);
        overlay.querySelector('[data-action="confirm"]').addEventListener('click', handleModalConfirm);

        return overlay;
    }

    function showModal(targetHref, stepId) {
        pendingHref = targetHref;
        pendingStepId = stepId;
        lastFocused = document.activeElement;

        const modal = ensureModalExists();
        modal.classList.remove('is-hidden');
        modal.setAttribute('aria-hidden', 'false');

        // Fokus sofort auf den Bestätigen-Button legen, damit Screenreader wissen, dass ein Dialog offen ist.
        const confirmBtn = modal.querySelector('[data-action="confirm"]');
        confirmBtn?.focus();
    }

    function hideModal() {
        const modal = document.getElementById(MODAL_ID);
        if (!modal) return;
        modal.classList.add('is-hidden');
        modal.setAttribute('aria-hidden', 'true');
        if (lastFocused?.focus) {
            lastFocused.focus();
        }
        pendingHref = null;
        pendingStepId = null;
    }

    // -------------------------------------------------------------
    // Datenverwaltung: optionales Zurücksetzen, falls explizit gefordert
    // -------------------------------------------------------------
    function resetStepData(stepId) {
        if (!stepId || !window.urlState?.setParams) return;
        const fieldsByStep = {
            step1: ["vorname", "nachname", "matrikel", "kurs", "studiengang", "semester", "vertiefung", "studiengangsleitung", "zeitraum"],
            step2: ["university", "universityId"],
            step3: ["selectedCourses", "semester"]
        };

        const deletions = {};
        (fieldsByStep[stepId] || []).forEach(key => {
            deletions[key] = "";
        });

        window.urlState.setParams(deletions);
    }

    // -------------------------------------------------------------
    // Event-Handler
    // -------------------------------------------------------------
    function handleModalConfirm() {
        if (!pendingHref) {
            hideModal();
            return;
        }
        const linkNeedingClear = document.querySelector(`[data-clear-step="${pendingStepId || ''}"]`);
        if (linkNeedingClear) {
            resetStepData(pendingStepId);
        }
        window.location.href = pendingHref;
    }

    function handleBackClick(ev) {
        try {
            const target = ev.currentTarget || ev.target;
            const href = (target && target.getAttribute && target.getAttribute('href')) || './index.html';

            const curStepNumber = parseInt(document.body?.dataset?.step || '0', 10) || null;
            const stepId = getCurrentStepId();

            const targetStep = extractStepFromHref(href);
            const isBackwards = targetStep && curStepNumber ? targetStep < curStepNumber : !!target?.dataset?.back;
            if (!isBackwards) return;

            if (ev?.preventDefault) ev.preventDefault();

            showModal(href, stepId);
        } catch (e) {
            console.error('back confirm handler error', e);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        try {
            const backLinks = Array.from(document.querySelectorAll('.step-navigation-buttons a[href], a#back, .back-btn, button[data-back]'));
            const uniqueLinks = Array.from(new Set(backLinks));
            uniqueLinks.forEach(link => {
                link.removeEventListener('click', handleBackClick);
                link.addEventListener('click', handleBackClick);
            });
        } catch (e) {
            console.error('back-confirm init error', e);
        }
    });
})();
