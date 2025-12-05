# 💬 OpenAI Chat-Server – Corporate Design Web-Progr.

Diese Anleitung erklärt, wie der **lokale OpenAI-Server** gestartet wird und wie über die Datei **chat.html** eine Anfrage an **GPT-4o-mini** gestellt werden kann.  
Der Server dient als **sichere Schnittstelle** zwischen dem Frontend und der OpenAI-API (der API-Key bleibt nur auf dem Server gespeichert).

---

## ⚙️ Voraussetzungen

- **Node.js** Version 18 oder höher
- **Gültiger OpenAI-API-Key**  
  👉 Anfrage an lui.schirmbeck.24@heilbronn.dhbw.de (oder luis.schirmbeck@gmail.com)

## 🚀 Server starten

1. **In das Server-Verzeichnis wechseln:**
   ```bash
   cd ../Corporate_Design/server
   ```
2. **Abhängigkeiten installieren (nur beim ersten Mal):**

   ```bash
   npm install
   ```

3. **Server starten:**

   ```bash
   npm run dev
   ```

   oder

   ```bash
   node server.js
   ```

4. **Erfolgreicher Start:**

   Im Terminal sollte erscheinen:

   ```
   ✅ API läuft auf http://localhost:3000
   ```

## 💻 Chat-Frontend verwenden

1. **Datei öffnen:**

   Öffne die Datei **chat.html** (oder deine Haupt-HTML-Seite mit eingebautem Chat), z. B. mit Live Server oder direkt im Browser.

2. **Chat testen:**

   Gib eine Frage in das Textfeld ein und klicke auf „Senden“.

3. **Kommunikation:**

   Der Client-Code in js/chat.js sendet die Eingabe an:

   http://localhost:3000/api/chat

4. **Antwort:**

   Die Antwort von GPT-4o-mini erscheint im Chatfenster unter dem Eingabefeld.

## 🧩 Hinweise

| Punkt         | Beschreibung                                                               |
| ------------- | -------------------------------------------------------------------------- |
| `.env`        | Darf **nicht** im Repository eingecheckt werden.                           |
| **Port**      | Kann in `server.js` angepasst werden (Standard: **3000**).                 |
| `npm install` | Nur beim ersten Start oder nach Änderungen an `package.json` erforderlich. |
