/**
 * footer.js
 * Steuert Interaktionen im Footer, insbesondere das Kontaktformular-Modal.
 * Behandelt das Öffnen/Schließen des Modals, Formularvalidierung und den Versand via Webhook.
 */
// footer.js – small screens: scrollable dialog only

(() => {
  // --- Helpers --------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));



  const setExpanded = (el, val) => el?.setAttribute('aria-expanded', String(val));

  // --- Modal Controls -------------------------------------------------------
  const octoBtn = $('.wi-footer__octo-btn');
  const modal = $('#octo-modal');
  if (!octoBtn || !modal) return;

  const dialog = modal; // Use the dialog element itself for scrolling logic
  const closeBtn = $('.modal__close', modal);
  let lastFocused = null;

  // 👉 NEU: Nur per JS – Dialog auf kleinen Screens scrollbar machen
  const mql = window.matchMedia('(max-width: 600px)');
  const applyDialogScrollMode = () => {
    if (!dialog) return;
    if (mql.matches) {
      // kleine Screens: Dialog selbst scrollen lassen
      dialog.style.maxHeight = '90vh';
      dialog.style.overflowY = 'auto';
      dialog.style.overscrollBehavior = 'contain';
      // optional: etwas Innenabstand, falls noch nicht vorhanden
      dialog.style.webkitOverflowScrolling = 'touch';
    } else {
      // große Screens: ggf. zurücksetzen
      dialog.style.maxHeight = '';
      dialog.style.overflowY = '';
      dialog.style.overscrollBehavior = '';
      dialog.style.webkitOverflowScrolling = '';
    }
  };
  // bei Größenwechsel neu anwenden
  mql.addEventListener?.('change', applyDialogScrollMode);
  // initial anwenden
  applyDialogScrollMode();

  const openModal = () => {
    lastFocused = document.activeElement;
    modal.showModal();
    document.body.style.overflow = 'hidden'; // Body bleibt fix – Scrollen im Dialog
    setExpanded(octoBtn, true);

    // sicherstellen, dass der Modus aktuell ist
    applyDialogScrollMode();
  };

  const closeModal = () => {
    modal.close();
  };

  // Cleanup when closed (via button or Escape)
  modal.addEventListener('close', () => {
    document.body.style.overflow = '';
    setExpanded(octoBtn, false);
    lastFocused?.focus?.();
  });

  // Öffnen/Schließen
  octoBtn.addEventListener('click', openModal);
  if (!octoBtn.hasAttribute('aria-expanded')) setExpanded(octoBtn, false);

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    // Close when clicking on backdrop
    const rect = modal.getBoundingClientRect();
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
    if (!isInDialog) {
      closeModal();
    }
  });

  /*
  Hinweis zum Formular-Versand:
  --------------------------------
  Das Formular sendet die Daten per sendBeacon bzw. fetch({ mode: 'no-cors' })
  an den Webhook. Dadurch wird kein CORS-Preflight ausgelöst und der Request
  kann auch ohne eigenes Backend erfolgreich abgesetzt werden.

  Einschränkung:
  Die Server-Antwort kann dabei nicht gelesen oder ausgewertet werden
  (opaque response). Deshalb ist keine echte Prüfung von Erfolg/Fehler auf
  Serverseite möglich – technisch bedingt durch die no-cors/sendBeacon-Methodik.
*/

  // --- Kontaktformular (einziger Submit-Handler) ---------------------------
  const form = $('#contact-form');
  if (!form) return;

  // 👉 Ziel: Webhook (JSON POST)
  const WEBHOOK_URL = 'https://webhook.site/a6bee94d-451b-45de-849c-933930e00206';

  // Kleiner Helper: Timeout für Fetch
  const fetchWithTimeout = (url, options = {}, timeoutMs = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(id));
  };

  form.addEventListener('submit', async (e) => {
    form.classList.add('was-validated');

    if (!form.checkValidity()) {
      e.preventDefault();
      const firstInvalid = form.querySelector(':invalid');
      firstInvalid?.focus();
      firstInvalid?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      return;
    }

    e.preventDefault();

    // Felder einsammeln
    const apSel = form.querySelector('#cf-ansprechpartner');
    const apValue = apSel?.value || '';
    const apLabel = apSel?.selectedOptions?.[0]?.textContent?.trim() || '';
    const anrede = form.querySelector('input[name="anrede"]:checked')?.value || '';
    const vorname = form.firstname?.value?.trim() || '';
    const nachname = form.lastname?.value?.trim() || '';
    const nachricht = form.message?.value?.trim() || '';
    const consent = !!form.consent?.checked;

    // Nutzersichtbare Metadaten (hilfreich im Webhook)
    const meta = {
      page_url: location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      timestamp_iso: new Date().toISOString()
    };

    // Payload zusammenstellen
    const payload = {
      form: 'wi_footer_contact',
      ansprechpartner: { value: apValue, label: apLabel },
      anrede,
      firstname: vorname,
      lastname: nachname,
      message: nachricht,
      consent,
      meta
    };

    // UI: Absende-Button sperren & Zustände anzeigen
    const submitBtn = form.querySelector('button[type="submit"]');
    const prevLabel = submitBtn?.textContent;
    submitBtn && (submitBtn.disabled = true, submitBtn.textContent = 'Senden …');

    try {
      // 1) Bevorzugt: sendBeacon → kein Preflight, fire-and-forget
      const beaconOk = (() => {
        try {
          const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' });
          return navigator.sendBeacon(WEBHOOK_URL, blob);
        } catch (_) {
          return false;
        }
      })();

      if (!beaconOk) {
        // 2) Fallback: fetch mit mode:'no-cors' (kein Header setzen!)
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          // KEINE headers setzen, sonst kommt wieder ein Preflight
          body: JSON.stringify(payload)
        });
        // Hinweis: Bei no-cors ist die Response "opaque" – kein res.ok verfügbar
      }

      // Erfolg (wir können die Server-Antwort nicht lesen, daher direkt bestätigen)
      alert('Vielen Dank! Ihre Nachricht wurde gesendet.');
      form.reset();
      form.classList.remove('was-validated');
      closeModal();

    } catch (err) {
      console.error('Webhook submit failed (client-only):', err);
      alert('Senden fehlgeschlagen. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel || 'Absenden';
      }
    }

  });

})();
