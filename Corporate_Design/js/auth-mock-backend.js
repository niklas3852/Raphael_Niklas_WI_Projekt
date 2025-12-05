/*
  =====================================================
  Authentifizierungs-Mock-Backend
  =====================================================
  Dieses Modul simuliert ein Backend für die Authentifizierung, indem es Fetch-Anfragen abfängt.
  Es ermöglicht die Entwicklung und das Testen der Login-Funktionalität ohne einen echten Server.

  Funktionalitäten:
  - Fängt Fetch-Aufrufe zu /api/login, /api/logout und /api/session-status ab
  - Verwaltet eine Liste von Dummy-Benutzern mit verschiedenen Rollen
  - Simuliert Session-Management mittels LocalStorage und Cookies
  - Validiert Anmeldedaten und Rollenzugehörigkeit
*/

(() => {
  // ------------------------------------------------------------------
  // Datenstrukturen
  // ------------------------------------------------------------------

  /**
   * Liste der registrierten Dummy-Benutzer.
   * Jeder Benutzer hat einen Benutzernamen, Passwort, Rolle, Anzeigenamen und optional Kurse.
   */
  const dummyUsers = [
    {
      username: "123456",
      password: "pass123",
      role: "student",
      name: "Max Mustermann",
      courses: ["WI24A3"],
    },
    {
      username: "987654",
      password: "password",
      role: "student",
      name: "Thomas Müller",
      courses: ["WI25A3"],
    },
    {
      username: "123987",
      password: "password",
      role: "student",
      name: "Andi Wand",
      courses: ["WI24A2"],
    },
    {
      username: "M1001",
      password: "dozent",
      role: "lecturer",
      name: "Tessa Steinigke",
    },
    {
      username: "M2002",
      password: "prof",
      role: "study_director",
      name: "Prof. Dr. von der Trenck",
    },
    {
      username: "M3003",
      password: "work",
      role: "employee",
      name: "Sabine Schmidt",
    },
    {
      username: "Netze BW GmbH",
      password: "partner",
      role: "partner",
      name: "Netze BW GmbH",
    },
    {
      username: "Sek24A3",
      password: "WI-Sekr",
      role: "secretariat",
      name: "Sekretariat WI DHBW",
    },
    {
      username: "MGMT404",
      password: "mgmt",
      role: "management",
      name: "Studiengangs Management",
    },
    {
      username: "LMsuper",
      password: "super",
      role: "supervisor",
      name: "Lisa Müller",
    },
  ];

  // ------------------------------------------------------------------
  // Session-Management
  // ------------------------------------------------------------------

  // Lokaler Session-Speicher (simuliert eine serverseitige Session-Datenbank)
  // Wird aus dem LocalStorage geladen, um Persistenz über Page-Reloads zu gewährleisten
  let sessionStore = JSON.parse(localStorage.getItem("mockSessions") || "{}");

  /**
   * Speichert den aktuellen Zustand der Sessions im LocalStorage.
   */
  function saveSessions() {
    localStorage.setItem("mockSessions", JSON.stringify(sessionStore));
  }

  // --- Hilfsfunktionen für Cookie-Handling ---

  /**
   * Liest den Wert eines Cookies anhand seines Namens aus.
   * @param {string} name - Der Name des gesuchten Cookies.
   * @returns {string|null} Der Wert des Cookies oder null, wenn nicht gefunden.
   */
  function getCookie(name) {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
  }

  /**
   * Generiert eine zufällige Session-ID (UUID v4 ähnlich).
   * @returns {string} Eine eindeutige ID-Zeichenkette.
   */
  function generateSessionId() {
    return (
      crypto.randomUUID?.() ||
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
    );
  }

  // ------------------------------------------------------------------
  // Fetch-Interception
  // ------------------------------------------------------------------

  // Originale Fetch-Funktion sichern, um echte Netzwerkanfragen weiterhin zu ermöglichen
  const originalFetch = window.fetch;

  /**
   * Überschreibt die globale window.fetch Funktion.
   * Fängt spezifische API-Endpunkte ab und simuliert deren Verhalten.
   * Alle anderen Anfragen werden an die originale fetch-Funktion weitergeleitet.
   */
  window.fetch = async function (url, options = {}) {
    let requestUrl = "";
    try {
      // URL normalisieren, um relative und absolute Pfade gleich zu behandeln
      const u = new URL(url, location.origin);
      requestUrl = u.pathname.toLowerCase();
      console.log("[MOCK] FETCH:", requestUrl);
    } catch {
      requestUrl = "";
    }


    const method = (options.method || "GET").toUpperCase();

    // Nur API-Endpunkte abfangen, die mit /api/ beginnen
    if (requestUrl.startsWith("/api/")) {
      // Simuliere eine Netzwerkverzögerung für realistischeres Verhalten
      await new Promise((r) => setTimeout(r, 200));

      // ---------------------------------------
      // LOGIN (/api/login)
      // ---------------------------------------
      if (requestUrl === "/api/login" && method === "POST") {
        const body = options.body ? JSON.parse(options.body) : {};
        const { username, password } = body.credentials;

        // Benutzer in der Dummy-Datenbank suchen
        const user = dummyUsers.find(
          (u) => u.username === username && u.password === password
        );

        // Fall: Benutzer nicht gefunden oder falsches Passwort
        if (!user) {
          return new Response(
            JSON.stringify({ error: "Ungültige Zugangsdaten" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Fall: Rolle passt nicht zum Benutzerkonto (Sicherheitscheck)
        if (body.type && user.role !== body.type) {
          return new Response(
            JSON.stringify({
              error: "Die gewählte Rolle passt nicht zum Benutzerkonto.",
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Erfolgreicher Login: Session erstellen
        const sessionId = generateSessionId();

        sessionStore[sessionId] = {
          username: user.name,
          roles: [user.role],
          loggedIn: true,
          created: Date.now(),
          courses: user.courses ?? [],
        };
        saveSessions();

        // Session-Cookie setzen (gültig für 12 Stunden)
        document.cookie = `userSession=${encodeURIComponent(
          sessionId
        )}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 12}`;

        // Erfolgsantwort zurückgeben
        return new Response(
          JSON.stringify({
            sessionId,
            loggedIn: true,
            username: user.name,
            roles: [user.role],
            courses: user.courses ?? [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // ---------------------------------------
      // LOGOUT (/api/logout)
      // ---------------------------------------
      if (requestUrl === "/api/logout" && method === "POST") {
        const sessionId = getCookie("userSession");

        // Session aus dem Store entfernen
        if (sessionId) {
          delete sessionStore[sessionId];
          saveSessions();
        }

        // Cookie löschen (durch Setzen eines vergangenen Datums)
        document.cookie =
          "userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=/;";

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // ---------------------------------------
      // SESSION-STATUS (/api/session-status)
      // ---------------------------------------
      if (requestUrl === "/api/session-status" && method === "GET") {
        const sessionId = getCookie("userSession");
        const session = sessionStore[sessionId];

        // Wenn eine gültige Session existiert, Status zurückgeben
        if (session?.loggedIn) {
          return new Response(
            JSON.stringify({
              loggedIn: true,
              username: session.username,
              roles: session.roles,
              courses: session.courses ?? [],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Keine gültige Session
        return new Response(
          JSON.stringify({ loggedIn: false, roles: [], username: "" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Leitet alle nicht abgefangenen Anfragen an die originale fetch-Funktion weiter
    return originalFetch(url, options);
  };

})();
