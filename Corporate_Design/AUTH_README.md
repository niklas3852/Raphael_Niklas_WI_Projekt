# 🧩 Authentifizierungs- und Session-System

## 📄 Übersicht

Dieses Modul stellt ein einfaches **Login- und Session-System für Entwicklungszwecke** bereit.  
Es simuliert ein Backend, speichert Sessiondaten im **Klartext-Cookie**, und ermöglicht den Zugriffsschutz auf Seiten anhand der Benutzerrolle.

Das System besteht aus folgenden Komponenten:

| Datei                            | Zweck                                                       |
| -------------------------------- | ----------------------------------------------------------- |
| **`js/auth-mock-backend.js`**    | Simuliert ein Backend für Login, Logout und Session-Status. |
| **`js/auth-session.js`**         | Verwalten der Session-Daten (Lesen/Schreiben im Cookie).    |
| **`js/ui/auth-popup.js`**        | Steuert das Login-Popup und führt den Login aus.            |
| **`components/auth-popup.html`** | HTML-Template des Login-Popups.                             |
| **`js/auth-guard.js`**           | Zugriffsschutz für Seiten basierend auf Rollen.             |

---

## ⚙️ Funktionsweise

### 🔹 1. Login-Ablauf

1. Das Login-Popup wird angezeigt (`auth-popup.html`), sobald `window.showAuthPopup()` aufgerufen wird – etwa wenn keine gültige Session gefunden wird.
2. Der Nutzer wählt eine Rolle (z. B. _Student/in_) und gibt Zugangsdaten ein.
3. `auth-popup.js` ruft die Funktion `login()` aus `auth-session.js` auf:
   - Diese sendet einen **Fake-Fetch-Request** an `/api/login`.
   - Dieser wird vom **Mock-Backend (`auth-mock-backend.js`)** abgefangen.
4. Bei erfolgreichem Login:
   - Es wird eine Session erstellt (`loggedIn: true, roles: [...]`).
   - Die Daten werden im **Cookie `userSession` (JSON im Klartext)** und im LocalStorage gespeichert.
   - Die Seite wird neu geladen.

**Beispiel-Inhalt des Cookies:**

```json
{
  "username": "Max Mustermann",
  "roles": ["student"],
  "loggedIn": true
}
```

### 🔹 2. Zugriffsschutz (auth-guard.js)

Auf jeder Seite kann geprüft werden, ob der aktuelle Benutzer eingeloggt ist und über bestimmte Rollen verfügt.

```javascript
import { getSessionStatus, hasRole } from "./auth-session.js";
import "./ui/auth-popup.js";

async function checkAccess() {
  const session = await getSessionStatus();
  const hasCookie = document.cookie.includes("userSession=");

  if (!hasCookie || !session.loggedIn) {
    window.showAuthPopup();
    return;
  }

  if (!hasRole("student")) {
    document.body.innerHTML = "<h1>Zugriff verweigert</h1>";
    return;
  }

  console.log("✅ Zugriff gewährt:", session.username);
}

document.addEventListener("DOMContentLoaded", checkAccess);
```

Damit kann man Seiten einfach schützen oder gezielt für Rollen freigeben.

### 🔹 3. Logout-Ablauf

Beim Logout (z. B. über einen Button im Header):

```javascript
import { logout } from "./auth-session.js";

await logout();
location.reload();
```

**Das löscht:**

den Cookie `userSession`

alle Einträge im `localStorage`

und beendet die Fake-Session im Mock-Backend.

### 🔧 Einbindung auf Seiten

**✅ Minimaler Setup**

---

**Mock-Backend laden (wird über helper-file geladen)**

siehe [`Project-README`](../README.md)

**Session- und Popup-Skripte einbinden**

```javascript
<script
  type="module"
  src="/Corporate_Design/js/auth-guard.js"
  data-auth-guard
  data-roles="student,lecturer" // --> erlaubte Rolle(n)
></script>
```

### Abfrage von Cookie-Daten

```javascript
import { returnRole, returnUserName, hasRole } from "../auth-session.js";

await hasRole("role"); // gibt true or false zurück
await returnRole(); // gibt Rolle als String zurück
await returnUserName(); // gibt Username als String zurück
```

### 🔐 Rollen und Benutzer

**Die Demo-Benutzer sind in auth-mock-backend.js hinterlegt:**

Mitarbeiter/in M3003 work
Partner OpenAI GmbH partner
Sekretariat WI_Sekr

| Rolle          | Benutzername  | Passwort |
| -------------- | ------------- | -------- |
| student        | 123456        | pass123  |
| lecturer       | M1001         | dozent   |
| study_director | M2002         | prof     |
| employee       | M3003         | work     |
| partner        | Netze BW GmbH | partner  |
| secretariat    | Sek24A3       | WI-Sekr  |
| management     | MGMT404       | mgmt     |

### ⚠️ Sicherheitshinweis

Wichtig:
Dieses System speichert Authentifizierungsdaten im **Klartext** im Cookie.
Es ist nicht sicher und darf nicht in Produktionsumgebungen verwendet werden.

Es dient ausschließlich zu:

Entwicklungs- und UI-Tests,

lokalen Auth-Simulationen ohne Backend,

schnellen Rollentests (Student, Dozent etc.).

In einer echten Anwendung sollte stattdessen:

ein **HTTP-only Session-Cookie** oder

ein **JWT-basierter Token-Mechanismus**
verwendet werden, damit sensible Daten (z. B. Rollen, Namen) nicht im Klartext im Browser sichtbar sind.
