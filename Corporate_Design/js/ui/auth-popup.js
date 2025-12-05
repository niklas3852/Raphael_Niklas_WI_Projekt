// js/ui/auth-popup.js
import { login } from "../auth-session.js";
import { resolveProjectPath } from "../path-helper.js";

/*
  =====================================================
  Authentifizierungs-Pop-up
  =====================================================
  Dieses Modul verwaltet das Login-Popup der Anwendung.
  
  Funktionalitäten:
  - Lädt das HTML für das Popup dynamisch aus /components/auth-popup.html
  - Zeigt das Popup als modalen Dialog an
  - Steuert die Sichtbarkeit der Eingabefelder basierend auf der gewählten Rolle
  - Führt den Login-Prozess über auth-session.js durch
  - Überwacht das DOM, um ein versehentliches oder mutwilliges Entfernen des Popups zu verhindern
*/

// Bestimmt den absoluten Pfad zur Popup-HTML-Datei basierend auf dem Projekt-Root
const popupURL = resolveProjectPath("Corporate_Design/components/auth-popup.html");

/**
 * Lädt das Authentifizierungs-Popup und zeigt es an.
 * Diese Funktion wird typischerweise aufgerufen, wenn ein nicht authentifizierter Benutzer
 * versucht, auf eine geschützte Ressource zuzugreifen.
 */
async function showAuthPopup() {
  try {
    // Abrufen des HTML-Inhalts für das Popup
    const response = await fetch(popupURL);
    if (!response.ok) throw new Error("Popup-Datei nicht gefunden!");
    const html = await response.text();

    // Erstellen eines Wrapper-Elements für das Popup
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    // Hinzufügen eines Overlays für den Hintergrund
    const overlay = document.createElement("div");
    overlay.classList.add("auth-overlay");
    wrapper.prepend(overlay);

    // Einfügen des Wrappers in den Body des Dokuments
    document.body.appendChild(wrapper);

    // Markieren des Body als "auth-open", um z.B. Scrollen zu verhindern
    document.body.classList.add("auth-open");

    // Referenzen auf wichtige DOM-Elemente im Popup holen
    const dialog = wrapper.querySelector("#auth-dialog");
    const roleSelect = wrapper.querySelector("#role-select");
    const fgStudent = wrapper.querySelector("#fg-student");
    const fgEmployee = wrapper.querySelector("#fg-employee");
    const fgCompany = wrapper.querySelector("#fg-company");
    const errorBox = wrapper.querySelector("#auth-errors");
    const form = wrapper.querySelector("#auth-form");
    const passwordInput = wrapper.querySelector("#password");


    /**
     * Entfernt das Popup und bereinigt den DOM.
     * Wird aufgerufen, wenn der Dialog geschlossen oder abgebrochen wird.
     */
    function cleanup() {
      document.body.classList.remove("auth-open");
      wrapper.remove();
    }

    // Event-Listener für das Schließen des Dialogs hinzufügen
    dialog.addEventListener("close", cleanup);
    dialog.addEventListener("cancel", cleanup);

    // 🔵 NEU: Sicherheitsmechanismus (DevTools-Hardening)
    // Überwacht Änderungen am DOM, um sicherzustellen, dass das Popup nicht entfernt wird,
    // solange der Benutzer nicht eingeloggt ist.
    const observer = new MutationObserver(() => {
      if (!document.body.contains(dialog)) {
        console.warn("⚠️ Popup wurde entfernt – stelle es wieder her.");
        observer.disconnect(); // Beobachter stoppen, um Endlosschleifen zu vermeiden
        showAuthPopup(); // Popup neu laden
      }
    });

    // Starten der Überwachung auf dem Body-Element
    observer.observe(document.body, { childList: true, subtree: true });


    /**
     * Aktualisiert die Sichtbarkeit der Eingabefelder basierend auf der gewählten Rolle.
     * @param {string} selectedValue - Die ausgewählte Rolle (z.B. "student", "employee").
     */
    function updateFields(selectedValue = "") {
      // Zuerst alle spezifischen Felder ausblenden
      fgStudent.style.display = "none";
      fgEmployee.style.display = "none";
      fgCompany.style.display = "none";

      // Dann das passende Feld basierend auf der Auswahl anzeigen
      if (selectedValue === "student") {
        fgStudent.style.display = "block";
      } else if (
        ["employee", "lecturer", "study_director", "secretariat", "management", "supervisor"].includes(
          selectedValue
        )
      ) {
        fgEmployee.style.display = "block";
      } else if (selectedValue === "partner") {
        fgCompany.style.display = "block";
      }
    }

    // Initialisierung der Felder beim Laden (verzögert, um sicherzustellen, dass DOM bereit ist)
    setTimeout(() => updateFields(roleSelect.value || ""), 0);

    // Event-Listener für Änderungen an der Rollenauswahl
    roleSelect.addEventListener("change", (e) => updateFields(e.target.value));

    // --- Login-Logik ---
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Standard-Formularversand verhindern

      const role = roleSelect.value;
      const password = passwordInput.value.trim();

      // Benutzernamen basierend auf der gewählten Rolle aus dem entsprechenden Feld lesen
      let username = "";
      if (role === "student")
        username = wrapper.querySelector("#matrikel").value.trim();
      else if (
        ["employee", "lecturer", "study_director", "secretariat", "management", "supervisor"].includes(role)
      )
        username = wrapper.querySelector("#mitNr").value.trim();
      else if (role === "partner")
        username = wrapper.querySelector("#company").value.trim();

      try {
        // Login-Versuch über die auth-session.js durchführen
        const result = await login({ username, password }, role);

        if (result?.loggedIn) {
          // Überprüfen, ob die zurückgegebene Rolle mit der ausgewählten übereinstimmt
          if (result.roles?.[0]?.toLowerCase() !== role.toLowerCase()) {
            throw new Error(
              `Die ausgewählte Rolle "${role}" stimmt nicht mit Ihrem Konto überein.`
            );
          }

          // Bei erfolgreichem Login: Popup schließen und aufräumen
          if (dialog?.open) dialog.close();
          if (wrapper?.parentNode) wrapper.remove();

          // Seite neu laden, um den authentifizierten Zustand zu reflektieren
          location.reload();

          // Optional: Zugriff direkt prüfen (falls checkAccess global verfügbar ist)
          if (typeof window.checkAccess === "function") {
            const roles = Array.isArray(window.__requiredRoles)
              ? window.__requiredRoles
              : [];
            setTimeout(() => window.checkAccess(roles, result), 0);
          }
        } else {
          throw new Error("Login fehlgeschlagen.");
        }
      } catch (error) {
        // Fehlerbehandlung: Fehlermeldung im Popup anzeigen
        console.error("Login-Fehler:", error);
        errorBox.classList.remove("visually-hidden");
        errorBox.textContent = error.message || "Login fehlgeschlagen!";
      }
    });

    // Dialog als modales Fenster öffnen
    if (dialog && typeof dialog.showModal === "function") {
      document.body.classList.add("auth-open");
      dialog.showModal();
    }
  } catch (err) {
    console.error("Fehler beim Laden des Popups:", err);
  }
}

// Funktion global verfügbar machen, damit sie von anderen Skripten aufgerufen werden kann
window.showAuthPopup = showAuthPopup;
