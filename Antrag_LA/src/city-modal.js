(function () {
    // Utility: inject modal stylesheet if not present
    function ensureModalCss() {
        try {
            const path = window.location.pathname || '';
            const href = path.includes('/pages/') ? '../styles/modal.css' : './styles/modal.css';
            if (!document.querySelector(`link[href="${href}"]`)) {
                const l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = href;
                document.head.appendChild(l);
            }
        } catch (e) {
            // ignore
            console.error('Fehler beim Laden der Modal-CSS', e);
        }
    }

    // Simple focus trap for modal
    function trapFocus(modal) {
        const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        function keyHandler(e) {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) { // shift + tab
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
        modal.__la_keyHandler = keyHandler;
        modal.addEventListener('keydown', keyHandler);
    }

    function releaseFocus(modal) {
        if (!modal) return;
        if (modal.__la_keyHandler) modal.removeEventListener('keydown', modal.__la_keyHandler);
        modal.__la_keyHandler = null;
    }

    // Create and show the modal
    async function showUserDataModal(matrikel) {
        ensureModalCss();

        try {
            const getUserStoredData = window.getUserStoredData;
            const getCurrentUser = window.getCurrentUser;
            let data;
            try {
                data = typeof getUserStoredData === 'function' ? getUserStoredData(matrikel) : null;
            } catch (e) {
                console.error('Fehler beim Lesen der gespeicherten Nutzerdaten', e);
                data = null;
            }

            const current = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;

            // MODIFIZIERTER AUSGABE-BLOCK: exportiert nun direkt `steps` statt `rawData` mit verschachteltem steps-Objekt
            const out = {
                exportedAt: new Date().toISOString(),
                profile: current || { matrikelnummer: matrikel },
                steps: (data && data.steps) ? data.steps : {}
            };

            // Build DOM
            const backdrop = document.createElement('div');
            backdrop.className = 'la-modal-backdrop';
            backdrop.setAttribute('role', 'dialog');
            backdrop.setAttribute('aria-modal', 'true');

            const modal = document.createElement('div');
            modal.className = 'la-modal';
            modal.setAttribute('tabindex', '-1');

            const header = document.createElement('div');
            header.className = 'la-modal-header';
            const titleWrap = document.createElement('div');
            const title = document.createElement('div');
            title.className = 'la-modal-title';
            title.textContent = 'Auszug: lokal gespeicherte Daten';
            const subtitle = document.createElement('div');
            subtitle.className = 'la-modal-subtitle';
            subtitle.textContent = `Stand: ${new Date(out.exportedAt).toLocaleString()}`;
            titleWrap.appendChild(title);
            titleWrap.appendChild(subtitle);

            const closeBtn = document.createElement('button');
            closeBtn.className = 'la-modal-close';
            closeBtn.setAttribute('aria-label', 'Schließen');
            closeBtn.innerHTML = '&times;';

            header.appendChild(titleWrap);
            header.appendChild(closeBtn);

            const body = document.createElement('div');
            body.className = 'la-modal-body';

            // JSON viewer
            const pre = document.createElement('pre');
            pre.className = 'la-json-viewer';
            try {
                pre.textContent = JSON.stringify(out, null, 2);
            } catch (e) {
                pre.textContent = 'Konnte die Daten nicht darstellen.';
            }

            body.appendChild(pre);

            const actions = document.createElement('div');
            actions.className = 'la-modal-actions';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'la-btn';
            copyBtn.type = 'button';
            copyBtn.textContent = 'Kopieren';

            const closeActionBtn = document.createElement('button');
            closeActionBtn.className = 'la-btn primary';
            closeActionBtn.type = 'button';
            closeActionBtn.textContent = 'Schließen';

            actions.appendChild(copyBtn);
            actions.appendChild(closeActionBtn);

            modal.appendChild(header);
            modal.appendChild(body);
            modal.appendChild(actions);
            backdrop.appendChild(modal);
            document.body.appendChild(backdrop);

            // Prevent background scroll
            document.body.style.overflow = 'hidden';

            // Focus management
            setTimeout(() => {
                closeBtn.focus();
                trapFocus(modal);
            }, 20);

            // Handlers
            function closeModal() {
                releaseFocus(modal);
                if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
                document.body.style.overflow = '';
                document.removeEventListener('keydown', keydownHandler);
            }

            function keydownHandler(e) {
                if (e.key === 'Escape') closeModal();
            }

            // backdrop click closes when clicking outside modal
            backdrop.addEventListener('click', (ev) => {
                if (ev.target === backdrop) closeModal();
            });

            closeBtn.addEventListener('click', closeModal);
            closeActionBtn.addEventListener('click', closeModal);
            document.addEventListener('keydown', keydownHandler);

            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(pre.textContent);
                    copyBtn.textContent = 'Kopiert ✓';
                    setTimeout(() => copyBtn.textContent = 'Kopieren', 1600);
                } catch (e) {
                    console.error('Copy failed', e);
                    copyBtn.textContent = 'Kopieren (fehlgeschlagen)';
                    setTimeout(() => copyBtn.textContent = 'Kopieren', 1600);
                }
            });

            // expose small API to close programmatically
            backdrop.__la_close = closeModal;

        } catch (e) {
            console.error('Fehler beim Öffnen des Data-Modals', e);
            try { alert('Fehler beim Anzeigen der lokalen Daten.'); } catch (_) {}
        }
    }

    // register global API
    try {
        window.showUserDataModal = showUserDataModal;
    } catch (e) {
        // ignore
    }
})();
