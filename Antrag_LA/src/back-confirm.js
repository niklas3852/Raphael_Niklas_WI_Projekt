// Intercept "Zurück" interactions and warn before leaving the current step.
(function () {
    const BROWSER_BACK_MSG = 'Willst du wirklich die Seite verlassen? Eventuell gehen nicht gespeicherte Änderungen verloren.';
    window.laAllowUnload = false;

    /**
     * Lädt das Stylesheet für die modale Rückfrage nach, falls es noch nicht eingebunden ist.
     * So bleibt das Layout konsistent, ohne dass andere Seiten explizit daran denken müssen.
     */
    function ensureModalCss() {
        const href = '../styles/modal.css';
        if (document.querySelector(`link[href="${href}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    /**
     * Baut die Ziel-URL für die Zurück-Navigation inklusive aller gespeicherten GET-Parameter.
     * Damit bleibt das Routing über Query-Strings auch mit lokal gespeicherten Werten stabil.
     */
    function buildBackUrl(defaultHref, currentStep) {
        const prevStep = currentStep > 1 ? currentStep - 1 : currentStep;
        const url = new URL(defaultHref || `./step${prevStep}.html`, window.location.href);

        if (currentStep > 1) {
            url.pathname = url.pathname.replace(/step\d+\.html/i, `step${prevStep}.html`);
        }

        if (window.location.search) {
            url.search = window.location.search;
        }

        return url.toString();
    }

    /**
     * Erzeugt und zeigt das Bestätigungs-Modal für alle Zurück-Aktionen.
     * Der Dialog ist per Tastatur bedienbar (Esc schließt, Fokus-Trap) und besitzt klare Texte für Screenreader.
     */
    function showBackModal(destination, currentStep) {
        ensureModalCss();

        const backdrop = document.createElement('div');
        backdrop.className = 'la-modal-backdrop';
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-modal', 'true');

        const modal = document.createElement('div');
        modal.className = 'la-modal';
        modal.tabIndex = -1;

        const header = document.createElement('div');
        header.className = 'la-modal-header';
        const title = document.createElement('div');
        title.className = 'la-modal-title';
        title.textContent = 'Einen Schritt zurückgehen?';
        const subtitle = document.createElement('div');
        subtitle.className = 'la-modal-subtitle';
        subtitle.textContent = `Aktueller Schritt: ${currentStep} – Daten bleiben erhalten.`;
        header.append(title, subtitle);

        const body = document.createElement('div');
        body.className = 'la-modal-body';
        body.innerHTML = '<p>Deine Eingaben wurden zwischengespeichert. Möchtest du wirklich zum vorherigen Schritt wechseln?</p>';

        const actions = document.createElement('div');
        actions.className = 'la-modal-actions';

        const cancel = document.createElement('button');
        cancel.className = 'la-btn';
        cancel.type = 'button';
        cancel.textContent = 'Abbrechen';
        cancel.addEventListener('click', () => backdrop.remove());

        const confirm = document.createElement('button');
        confirm.className = 'la-btn primary';
        confirm.type = 'button';
        confirm.textContent = 'Zurückwechseln';
        confirm.addEventListener('click', () => {
            backdrop.remove();
            window.laAllowUnload = true;
            setTimeout(() => { window.location.href = destination; }, 60);
        });

        actions.append(cancel, confirm);
        modal.append(header, body, actions);
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        const focusable = Array.from(backdrop.querySelectorAll('button'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        backdrop.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                backdrop.remove();
                return;
            }
            if (event.key !== 'Tab' || focusable.length === 0) return;
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        setTimeout(() => first?.focus(), 20);
    }

    function handleBackClick(ev) {
        try {
            if (ev && ev.preventDefault) ev.preventDefault();
            const target = ev.currentTarget || ev.target;
            const hrefAttr = (target && target.getAttribute && target.getAttribute('href')) || './index.html';
            const currentStep = parseInt(document.body?.getAttribute('data-step') || '0', 10) || 0;
            const destination = buildBackUrl(hrefAttr, currentStep);

            showBackModal(destination, currentStep);
        } catch (e) {
            /* ignore */
        }
    }

    function installBrowserBackWarning() {
        window.addEventListener('beforeunload', (event) => {
            if (window.laAllowUnload) return;
            event.preventDefault();
            event.returnValue = BROWSER_BACK_MSG;
            return BROWSER_BACK_MSG;
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        try {
            installBrowserBackWarning();

            const currentStep = parseInt(document.body?.getAttribute('data-step') || '0', 10) || 0;

            const candidates = Array.from(document.querySelectorAll('a[href]'));
            candidates.push(...Array.from(document.querySelectorAll('.back-btn, button[data-back]')));

            candidates.forEach(link => {
                const href = link.getAttribute && link.getAttribute('href');
                const targetMatch = href && href.match(/step(\d+)\.html/i);
                const targetStep = targetMatch ? parseInt(targetMatch[1], 10) : null;

                const shouldConfirm = link.matches('a#back, .back-btn, button[data-back]') || (currentStep && targetStep && targetStep < currentStep);
                if (!shouldConfirm) return;

                link.removeEventListener('click', handleBackClick);
                link.addEventListener('click', handleBackClick);
            });
        } catch (e) {
            /* ignore */
        }
    });
})();
