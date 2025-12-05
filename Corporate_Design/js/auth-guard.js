/**
 * auth-guard.js
 * Überprüft, ob der Benutzer die erforderlichen Berechtigungen für die aktuelle Seite hat.
 * Leitet bei fehlender Berechtigung oder fehlendem Login entsprechend weiter.
 */
import { getSessionStatus, logout } from "./auth-session.js";
import "./ui/auth-popup.js"; // stellt window.showAuthPopup bereit
import { getProjectRoot } from "./path-helper.js";

// nimmt für Seite erlaubte Rollen aus data-roles-Tag und trennt bei `,`
function getRequiredRoles() {
  const script =
    document.currentScript || document.querySelector("script[data-auth-guard]");
  const raw = (script?.dataset?.roles || "").trim();
  return raw
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
}

// Prüft für jede Rolle in in requiredRoles-Array
async function checkAccess(requiredRoles = []) {
  window.__requiredRoles = requiredRoles;

  const session = await getSessionStatus();
  const hasCookie = document.cookie.includes("userSession=");

  if (!session.loggedIn) {
    console.warn("Keine aktive Session – öffne Login-Popup");
    window.showAuthPopup?.();
    return false;
  }

  const userRoles = (session.roles || []).map((r) => r.toLowerCase()); // alle Rollen des Users in Kleinbuchstaben, ansonsten leeres Array
  const allowed =
    requiredRoles.length === 0 ||
    requiredRoles.some((r) => userRoles.includes(r)); // Prüft ob min. eine der Rollen des Users im data-roles-Tag
  // Error Message mit Button auf Persönliches Dashboard
  if (!allowed) {
    const rootHref = getProjectRoot();
    console.log("Root: " + rootHref);
    document.body.innerHTML = `
        <main style="text-align:center; padding: 4rem;">
            <h1>Zugriff verweigert</h1>
            <p>Diese Seite ist nur für ${requiredRoles.join(", ") || "autorisierte"
      } Benutzer zugänglich.</p>
            <button onclick="location.href='${rootHref}Persönliches_Dashboard/index.html'" class="btn primary">
            Zur Startseite
            </button>
        </main>`;
    return false;
  }

  return true;
}

// Global verfügbar für Popup
window.checkAccess = checkAccess;

// ======= Automatisch beim Laden ausführen =======
async function initAuthGuard() {
  const roles = getRequiredRoles();

  // Warte bis showAuthPopup verfügbar ist
  await new Promise((resolve) => {
    (function waitForPopup() {
      if (typeof window.showAuthPopup === "function") resolve();
      else setTimeout(waitForPopup, 50);
    })();
  });

  await checkAccess(roles);
}

// Wenn DOM schon fertig ist → sofort starten
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuthGuard);
} else {
  // DOM ist schon fertig → direkt starten
  initAuthGuard();
}


