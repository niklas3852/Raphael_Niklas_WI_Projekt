import { getProjectRoot, resolveProjectPath } from "../path-helper.js";
/*
  Sichere, automatische Includes
  ---------------------------------
  - <div data-include="header"></div>
  - Lädt:
      components/<name>.html
      css/<name>.css
      js/ui/<name>.js
      css/corporate-design.css
  - Sicherheitsfunktionen:
      • Blockiert javascript:-Protokolle
      • Blockiert Cross-Origin
      • Prüft MIME-Type
      • Nutzt <template> statt innerHTML
*/

(function () {
  const DEBUG = false;

  // ---- Hauptfunktion: Includes laden ----
  async function includeHTML() {
    const slots = document.querySelectorAll("[data-include]");
    if (!slots.length) return;

    const rootHref = getProjectRoot();

    for (const el of slots) {
      const name = (el.dataset.include || "").trim();
      if (!name) {
        el.textContent = "Include: kein Dateiname";
        continue;
      }

      // Pfade konsistent über resolveProjectPath
      const htmlPath = resolveProjectPath(`Corporate_Design/components/${name}.html`);
      const cssPath = resolveProjectPath(`Corporate_Design/css/${name}.css`);
      const jsPath = resolveProjectPath(`Corporate_Design/js/ui/${name}.js`);
      const corpCSS = resolveProjectPath("Corporate_Design/css/corporate-design.css");
      const jsTemplates = resolveProjectPath("Corporate_Design/js/ui/header.templates.js");

      try {
        const url = new URL(htmlPath, rootHref);

        // Sicherheitsprüfungen
        if (url.protocol === "javascript:")
          throw new Error("Unsupported protocol (javascript:)");

        const isHttp = url.protocol === "http:" || url.protocol === "https:";
        if (isHttp && url.origin !== location.origin)
          throw new Error("Cross-origin include blockiert");

        // HTML laden
        const res = await fetch(url.toString(), {
          cache: "no-cache",
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error(res.statusText || "Fetch fehlgeschlagen");

        const ct = res.headers.get("content-type") || "";
        if (ct && !ct.includes("text/html"))
          throw new Error(`Unerwarteter Content-Type: ${ct}`);

        const html = await res.text();

        // Template erstellen
        const tpl = document.createElement("template");
        tpl.innerHTML = html;

        // ----------------------------------------
        // HEADER (Shadow DOM + modulare Struktur)
        // ----------------------------------------
        if (name === "header") {
          const shadow = el.shadowRoot || el.attachShadow({ mode: "open" });

          // HTML in Shadow DOM einfügen
          shadow.replaceChildren(tpl.content.cloneNode(true));

          // CSS im Shadow DOM einfügen
          const linkCorp = document.createElement("link");
          linkCorp.rel = "stylesheet";
          linkCorp.href = corpCSS;

          const linkComp = document.createElement("link");
          linkComp.rel = "stylesheet";
          linkComp.href = cssPath;

          shadow.append(linkCorp, linkComp);

          // Header Templates laden (nur 1× global)
          if (!document.querySelector(`script[src="${jsTemplates}"]`)) {
            const t = document.createElement("script");
            t.src = jsTemplates;
            document.body.appendChild(t);
            await new Promise((resolve) => (t.onload = resolve));
          }

          // JS-Modul dynamisch importieren
          const jsModulePath = resolveProjectPath(`Corporate_Design/js/ui/${name}.js`);
          const importUrl = `${jsModulePath}?v=${Date.now()}`;

          try {
            const mod = await import(importUrl);
            if (typeof mod.initHeader === "function") {
              await mod.initHeader(shadow);
              if (DEBUG)
                console.log("[Include][Header] initHeader() ausgeführt");
            } else {
              console.warn(`[Include][Header] Modul ${name}.js hat keine initHeader-Funktion`);
            }
          } catch (e) {
            console.error("[Include][Header] Modul-Importfehler:", e);
          }

          // ----------------------------------------
          // NICHT-HEADER (klassisches Include)
          // ----------------------------------------
        } else {

          // HTML rein
          el.replaceChildren(tpl.content.cloneNode(true));

          // Link-Rewrite
          try {
            const links = el.querySelectorAll("a[href]");
            links.forEach((link) => {
              const href = link.getAttribute("href");
              if (
                href &&
                !href.startsWith("http") &&
                !href.startsWith("#") &&
                !href.startsWith("mailto:") &&
                !href.startsWith("tel:")
              ) {
                const absolute = new URL(href, rootHref);
                link.setAttribute(
                  "href",
                  absolute.pathname + absolute.search + absolute.hash
                );
              }
            });
          } catch (err) {
            if (DEBUG) console.warn("[Include] Link rewrite failed:", err);
          }

          // Komponenten-CSS global laden
          if (!document.querySelector(`link[href="${cssPath}"]`)) {
            const l = document.createElement("link");
            l.rel = "stylesheet";
            l.href = cssPath;
            document.head.appendChild(l);
          }

          // Komponenten-JS global laden
          if (!document.querySelector(`script[src="${jsPath}"]`)) {
            const s = document.createElement("script");
            s.src = jsPath;
            s.defer = true;
            document.body.appendChild(s);
          }
        }

        if (DEBUG) console.log(`[Include] ${name} erfolgreich geladen`);

      } catch (err) {
        el.textContent = `Include fehlgeschlagen: ${name}`;
        el.dataset.includeError = "1";
        if (DEBUG) console.error("[Include]", err);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", includeHTML);
})();
