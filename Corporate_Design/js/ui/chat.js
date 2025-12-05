/**
 * chat.js
 * Steuert das Chat-Widget, inklusive Kommunikation mit dem Backend-API.
 * Behandelt das Senden von Nachrichten, Empfangen von Antworten und Reset des Verlaufs.
 */
// Basis-URL der API, lokal läuft der Server unter http://localhost:3000
// In der Produktion liegt hier die richtige Domain
const API_BASE = "http://localhost:3000";

// Kurze Hilfsfunktion für document.querySelector
const $ = (sel) => document.querySelector(sel);

// Klick-Event für den "Senden"-Button --> führt sendMessage() aus
$("#send-btn")?.addEventListener("click", sendMessage);

// Klick-Event für Chat-Verlauf zurücksetzen --> führt resetHistory() aus
$("#reset-history")?.addEventListener("click", resetHistory);

// Tastatur-Event auf dem Eingabefeld (#chat-input)
// Wenn Enter + Strg (oder Cmd) gedrückt wird --> Nachricht wird gesendet
$("#chat-input")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Asynchrone Funktion zum Senden der Benutzernachricht an die API
async function sendMessage() {
  // Selektiert Eingabe- und Ausgabeelemente aus dem DOM
  const input = $("#chat-input");
  const out = $("#chat-output");

  // Liest den Text aus dem Eingabefeld und entfernt überflüssige Leerzeichen
  const message = (input?.value || "").trim();

  // Falls das Eingabefeld leer ist --> Abbruch (keine Anfrage senden)
  if (!message) return;

  // Eingabefeld leeren mit absenden
  input.value = "";

  // Zeigt dem Benutzer an, dass die Anfrage verarbeitet wird
  out.textContent = "⏳ Denke nach...";

  try {
    // Sendet eine POST-Anfrage an den Server-Endpunkt /api/chat
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    // Wandelt die Server-Antwort in ein JSON-Objekt um
    const data = await res.json();

    // Fehler werfen, wenn der Server einen Fehlerstatus zurückgibt
    if (!res.ok) throw new Error(data?.error || "Unbekannter Fehler");

    // Zeigt die Antwort des Chatbots im Ausgabebereich an
    out.textContent = data.reply || "(Keine Antwort erhalten)";
  } catch (err) {
    // Falls ein Fehler auftritt (Netzwerk, Server etc.)
    // --> Fehlermeldung im Ausgabefeld anzeigen
    out.textContent = "⚠️ Fehler: " + err.message;
  }
}

// Funktion, um API-Anfrage an Server zu senden --> löscht Chat-Verlauf
async function resetHistory() {
  try {
    fetch(`${API_BASE}/api/reset`, { method: "POST" });
  } catch (err) {
    console.log(err.message);
  }
}

// Referenzen auf DOM-Elemente für das Ein-/Ausblenden des Chats
const toggleBtn = document.getElementById("chat-toggle");
const chatContainer = document.getElementById("chat-container");
const closeBtn = document.getElementById("chat-close");

// Event-Listener zum Öffnen/Schließen des Chat-Fensters
toggleBtn.addEventListener("click", () => {
  chatContainer.classList.toggle("active");
});

// Event-Listener für den Schließen-Button innerhalb des Chats
closeBtn.addEventListener("click", () => {
  chatContainer.classList.remove("active");
});
