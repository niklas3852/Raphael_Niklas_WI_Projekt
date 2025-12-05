/**
 * settings.js
 * Steuert die Interaktionen auf der Einstellungsseite.
 * Behandelt das Kopieren der E-Mail-Adresse und das Speichern von Änderungen an Kontaktdaten via Webhook.
 */
document.addEventListener("DOMContentLoaded", () => {
  // --- 1) Copy-Button für persönliche E-Mail ------------------------
  // Ermöglicht das Kopieren der E-Mail-Adresse in die Zwischenablage
  const emailBox = document.querySelector(".email-container");
  const copyBtn = document.querySelector(".copy-btn");

  if (emailBox && copyBtn) {
    const originalContent = copyBtn.innerHTML;

    copyBtn.addEventListener("click", async () => {
      const emailText = emailBox.textContent.trim();

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(emailText);
        }

        // Icon → Haken
        copyBtn.innerHTML = "✓";
        copyBtn.classList.add("copy-btn--copied");

        setTimeout(() => {
          copyBtn.innerHTML = originalContent;
          copyBtn.classList.remove("copy-btn--copied");
        }, 1500);
      } catch (err) {
        console.error("Kopieren fehlgeschlagen:", err);
        alert("Konnte die E-Mail nicht in die Zwischenablage kopieren.");
      }
    });
  }

  // --- Helper: Validierungen ------------------------
  // Prüft auf gültiges E-Mail-Format und nicht-leere Eingaben
  const isValidEmail = (value) => {
    const trimmed = value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const isNonEmpty = (value) => value.trim().length > 0;

  // --- 2) ✓-Buttons nur bei Änderungen anzeigen + an Webhook senden --
  // Überwacht Eingabefelder auf Änderungen und zeigt Speichern-Button an
  const inputs = document.querySelectorAll(".settings-input");

  inputs.forEach((input) => {
    let initialValue =
      input.getAttribute("data-initial-value") ?? input.value ?? "";

    const saveBtn = document.querySelector(`[data-save-for="#${input.id}"]`);
    if (!saveBtn) return;

    const isEmailInput = input.type === "email";

    saveBtn.hidden = true;

    // Funktion zur Aktualisierung der Sichtbarkeit des Speichern-Buttons
    const updateVisibility = () => {
      const currentValue = input.value.trim();

      const changed = currentValue !== initialValue.trim();
      const notEmpty = isNonEmpty(currentValue);
      const validEmail = !isEmailInput || isValidEmail(currentValue);

      saveBtn.hidden = !(changed && notEmpty && validEmail);
    };

    input.addEventListener("input", updateVisibility);

    // Klick-Handler für den Speichern-Button
    saveBtn.addEventListener("click", async () => {
      const newValue = input.value.trim();
      saveBtn.disabled = true;

      // Safeguard: Beim Klick erneut prüfen
      if (!isNonEmpty(newValue)) {
        alert("Das Feld darf nicht leer sein.");
        saveBtn.disabled = false;
        return;
      }

      if (isEmailInput && !isValidEmail(newValue)) {
        alert("Bitte eine gültige E-Mail-Adresse eingeben.");
        saveBtn.disabled = false;
        return;
      }

      // Daten für den Webhook vorbereiten
      const body = new URLSearchParams();
      body.set("type", "contact-update");
      body.set("fieldId", input.id);
      body.set("fieldName", input.name);
      body.set("value", newValue);
      body.set("timestamp", new Date().toISOString());

      try {
        // Senden der Daten an den Webhook (no-cors, da externe Domain)
        await fetch("https://webhook.site/b8ae0ebf-7876-4659-be9a-60987080e8b9", {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: body.toString(),
        });

        initialValue = newValue;
        input.setAttribute("data-initial-value", newValue);
        saveBtn.hidden = true;
      } catch (err) {
        console.error("Fehler beim Webhook:", err);
      } finally {
        saveBtn.disabled = false;
      }
    });
  });

});
