/**
 * server.js
 * Ein einfacher Express-Server, der als Proxy für die OpenAI API dient.
 * Er verwaltet den Chat-Verlauf und stellt Endpunkte für den Chat-Bot bereit.
 */
// Importiert das Express-Framework zum Erstellen eines Webservers
import express from "express";

// Importiert "node-fetch" zum Senden von HTTP-Anfragen (hier: an die OpenAI API)
import fetch from "node-fetch";

// Importiert CORS-Middleware, um Cross-Origin-Anfragen zu ermöglichen
import cors from "cors";

// Importiert dotenv, um Umgebungsvariablen aus einer .env-Datei zu laden
import dotenv from "dotenv";

import { systemPrompt } from "./systemprompt.js";

// Lädt Umgebungsvariablen aus der .env-Datei
dotenv.config();

// Erstellt eine neue Express-Anwendung
const app = express();

// Aktiviert CORS
app.use(cors());

// Aktiviert JSON-Parsing für eingehende Anfragen
app.use(express.json());

// globale Variable zum Speichern des Chat-Verlaufs
const conversationHistory = [];

// Definiert eine POST-Route unter /api/chat
app.post("/api/chat", async (req, res) => {
  try {
    // Liest die Benutzernachricht aus dem Request-Body
    const userMessage = (req.body?.message || "").toString().trim();

    // Falls keine Nachricht gesendet wurde, gibt der Server einen Fehler zurück
    if (!userMessage) {
      return res.status(400).json({ error: "message fehlt" });
    }

    // Definiert den System-Prompt
    const prompt = systemPrompt;

    // aktuelle user-message zur Conversation hinzufügen
    conversationHistory.push({ role: "user", content: userMessage });

    const messages = [
      { role: "system", content: prompt } /* Systemrolle */,
      ...conversationHistory,
    ];

    // Sendet eine Anfrage an die OpenAI Chat Completions API
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", // HTTP-Methode
      headers: {
        // Fügt den OpenAI-API-Schlüssel aus der .env-Datei hinzu
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      // Übergibt das Modell, den Systemprompt und die Benutzernachricht
      body: JSON.stringify({
        model: "gpt-4o-mini", // schnelles und günstiges Modell
        messages: messages,
      }),
    });

    // Prüft, ob die API geantwortet hat --> ansonsten Fehler
    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(502).json({ error: "OpenAI-Fehler", details: errText });
    }

    // Wandelt die API-Antwort in JSON um
    const data = await resp.json();

    // Extrahiert die Chat-Antwort aus dem JSON (falls vorhanden)
    const reply = data?.choices?.[0]?.message?.content ?? "";

    // fügt Bot-Antwort in Chat-Verlauf hinzu
    conversationHistory.push({ role: "assistant", content: reply });

    // Sendet die Antwort an den Client zurück
    return res.json({ reply });
  } catch (e) {
    // Gibt unerwartete Serverfehler in der Konsole aus
    console.error(e);

    // Sendet eine allgemeine Fehlermeldung an den Client
    return res.status(500).json({ error: "Serverfehler" });
  }
});

// Route zum zurücksetzen des Verlaufs
app.post("/api/reset", (req, res) => {
  conversationHistory.length = 0;
  res.json({ success: true, message: "Gesprächsverlauf zurückgesetzt." });
});

// Definiert den Port (aus .env oder Standard: 3000)
const PORT = process.env.PORT || 3000;

// Startet den Server und gibt eine Bestätigung in der Konsole aus
app.listen(PORT, () => {
  console.log(`✅ API läuft auf http://localhost:${PORT}`);
});
