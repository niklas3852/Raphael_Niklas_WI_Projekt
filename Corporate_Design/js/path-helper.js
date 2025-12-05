/**
 * path-helper.js
 * Hilfsfunktionen zur dynamischen Pfadermittlung und zum Laden von Assets (CSS, JS).
 * Ermöglicht die korrekte Einbindung von Ressourcen unabhängig von der Verschachtelungstiefe.
 */
// ---- Bekannte Projektordner erkennen ----
const possibleRoots = [
  "wi24a3-webp-wi-project", // lokale Git-Version
  "WI24A3",                 // Server-Hauptordner
  "WebP",                   // Unterordner auf dem Server
  "data"                    // Unterordner mit den HTML-Dateien
];

// ---- Projekt-Root automatisch bestimmen ----
export function getProjectRoot() {
  const parts = location.pathname.split("/").filter(Boolean);
  const idx = parts.findIndex((p) => possibleRoots.includes(p));

  if (idx !== -1)
    return location.origin + "/" + parts.slice(0, idx + 1).join("/") + "/";

  // Fallback für file:// oder untypische Umgebungen
  let ups = "";
  for (let k = 0; k < parts.length; k++) ups += "../";
  return new URL(ups, location.href).href;
}

// ---- Pfad relativ zum Projekt-Root auflösen ----
export function resolveProjectPath(relativePath) {
  return new URL(relativePath, getProjectRoot()).href;
}

// ---- CSS dynamisch laden ----
export function loadCSS(relativePath) {
  const url = resolveProjectPath(relativePath);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
  return link;
}

// ---- Script dynamisch laden ----
export function loadScript(relativePath, attributes = {}) {
  const url = resolveProjectPath(relativePath);
  const script = document.createElement("script");

  // Standardverhalten: module oder normales Script
  const isModule = attributes.type === "module" || !attributes.type;
  script.type = isModule ? "module" : "text/javascript";
  script.src = url;
  if (!isModule) script.defer = true;

  for (const [key, value] of Object.entries(attributes)) {
    if (!["type", "src"].includes(key)) {
      script.setAttribute(key, value);
    }
  }

  document.body.appendChild(script);
  console.log("[Script Loader] Script geladen:", url, attributes);
  return script;
}

// ---- Kombinierte Funktion: Lädt Corporate Design (CSS + JS) ----
export function loadCorporateDesignAssets() {
  const cssFiles = [
    "Corporate_Design/css/cd-select.css",
    "Corporate_Design/css/auth-popup.css",
  ];

  const jsFiles = [
    {
      path: "Corporate_Design/js/ui/cd-select.js",
      attributes: { type: "text/javascript", defer: "" },
    },
    {
      path: "Corporate_Design/js/auth-mock-backend.js",
      attributes: { type: "text/javascript", defer: "" },
    },
  ];

  // ---- CSS laden ----
  cssFiles.forEach((file) => loadCSS(file));

  // ---- Scripts laden ----
  jsFiles.forEach(({ path, attributes }) => loadScript(path, attributes));

  console.log("[Corporate Design] Assets geladen:", { cssFiles, jsFiles });
}

export function loadAuthGuard(roles = "student") {
  return loadScript("Corporate_Design/js/auth-guard.js", {
    type: "module",
    "data-auth-guard": "",
    "data-roles": roles
  });
}

// ---- Optional global verfügbar machen ----
window.resolveProjectPath = resolveProjectPath;
window.loadCSS = loadCSS;
window.loadScript = loadScript;
window.loadCorporateDesignAssets = loadCorporateDesignAssets;
