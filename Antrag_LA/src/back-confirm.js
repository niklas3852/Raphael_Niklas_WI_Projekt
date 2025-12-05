// Intercept "Zurück" interactions and warn before leaving the current step.
(function () {
    const CONFIRM_MSG = 'Du springst einen Schritt zurück. Deine Eingaben bleiben erhalten. Möchtest du fortfahren?';
    const BROWSER_BACK_MSG = 'Willst du wirklich die Seite verlassen? Eventuell gehen nicht gespeicherte Änderungen verloren.';

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

    function handleBackClick(ev) {
        try {
            if (ev && ev.preventDefault) ev.preventDefault();
            const target = ev.currentTarget || ev.target;
            const hrefAttr = (target && target.getAttribute && target.getAttribute('href')) || './index.html';
            const currentStep = parseInt(document.body?.getAttribute('data-step') || '0', 10) || 0;
            const destination = buildBackUrl(hrefAttr, currentStep);

            const confirmed = window.confirm(CONFIRM_MSG);
            if (!confirmed) return;

            setTimeout(() => { window.location.href = destination; }, 80);
        } catch (e) {
            console.error('back confirm handler error', e);
        }
    }

    function installBrowserBackWarning() {
        if (!window.history?.pushState) return;

        window.history.pushState({ stay: true }, document.title, window.location.href);

        window.addEventListener('popstate', (event) => {
            if (!event.state || !event.state.stay) return;
            const confirmed = window.confirm(BROWSER_BACK_MSG);
            if (confirmed) {
                window.history.back();
            } else {
                window.history.pushState({ stay: true }, document.title, window.location.href);
            }
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
            console.error('back-confirm init error', e);
        }
    });
})();
