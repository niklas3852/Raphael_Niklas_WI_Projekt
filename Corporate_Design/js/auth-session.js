/*
  auth-session.js
  ---------------------------------
  Modul für Authentifizierung und Session-Handling
  + Cookie-Handling für Entwicklungsphase
*/

// 🕓 Warte, bis Mock-Backend initialisiert ist (nur für Dev)
await new Promise((resolve) => {
  const start = performance.now();

  (function waitForMock() {
    // Prüfe, ob fetch bereits vom Mock ersetzt wurde
    if (window.fetch && !window.fetch.toString().includes("[native code]")) {
      console.log("[Auth-Session] Mock-Backend erkannt ✅");
      resolve();
    } else if (performance.now() - start > 2000) {
      console.warn("[Auth-Session] Kein Mock-Backend gefunden ⚠️");
      resolve(); // nach 2s abbrechen, um Hänger zu vermeiden
    } else {
      setTimeout(waitForMock, 50);
    }
  })();
});

const COOKIE_NAME = "userSession";

// Hilfsfunktion: Cookie auslesen
function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

// Hilfsfunktion: Cookie löschen
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Login: Sendet Zugangsdaten an Backend und startet Session
export async function login(credentials, type) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credentials, type }),
  });

  if (!response.ok) {
    throw new Error("Login fehlgeschlagen!");
  }

  const sessionData = await response.json(); // {roles: [...], username: '...'}

  // Lokale Speicherung
  if (Array.isArray(sessionData.roles)) {
    localStorage.setItem("userRoles", JSON.stringify(sessionData.roles));
    localStorage.setItem("userName", sessionData.username || "");
    localStorage.setItem("courses", JSON.stringify(sessionData.courses))
  }

  return { ...sessionData, loggedIn: true };
}

// Logout: Beendet Session am Backend und entfernt lokale Daten + Cookie
export async function logout() {
  const response = await fetch("/api/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Logout fehlgeschlagen!");
  }

  localStorage.removeItem("userRoles");
  localStorage.removeItem("userName");
  localStorage.removeItem("courses");
  deleteCookie(COOKIE_NAME);

  return await response.json(); // {success: true}
}

// Prüft, ob der aktuell eingeloggte Nutzer eine bestimmte Rolle hat
export async function hasRole(role) {
  const roles = JSON.parse(localStorage.getItem("userRoles") || "[]");
  if (roles.includes(role)) return true;

  // Fallback: Backend fragen
  const status = await getSessionStatus();
  return status.roles?.includes(role);
}

// gibt Rolle des aktuellen Nutzers zurück
export async function returnRole() {
  let roles = JSON.parse(localStorage.getItem("userRoles") || "[]");
  if (roles.length) return roles[0].toLowerCase();

  const status = await getSessionStatus();
  if (Array.isArray(status.roles) && status.roles.length > 0)
    return status.roles[0].toLowerCase();

  return "unknown";
}

// gibt den Benutzernamen des aktuellen Nutzers zurück
export async function returnUserName() {
  let name = localStorage.getItem("userName");
  if (name) return name;

  const status = await getSessionStatus();
  return status.username || "Unbekannter Benutzer";
}

export async function returnUserCourses() {
  let courses = localStorage.getItem("courses");
  if (courses) return courses;

  const status = await getSessionStatus();
  return status.courses || "kein Kurs zugewiesen";
}

// Liefert aktuellen Sessionstatus
export async function getSessionStatus() {
  try {
    const response = await fetch("/api/session-status", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const sessionData = await response.json();

      if (sessionData.loggedIn) {
        // Lokale Kopie speichern
        localStorage.setItem("userRoles", JSON.stringify(sessionData.roles));
        localStorage.setItem("userName", sessionData.username || "");
      }

      return sessionData;
    }
  } catch (e) {
    console.warn("[Auth] Session-Abfrage fehlgeschlagen:", e);
  }

  // Fallback: wenn kein aktiver Status → ausgeloggt
  return { loggedIn: false, roles: [], username: "" };
}

