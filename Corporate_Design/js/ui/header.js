/**
 * Initialisiert den Header einer Seite.
 * - Fügt Header-Template je nach Benutzer ein
 * - Passt relative Links an die Projektstruktur an
 * - Steuert Dropdown-Menüs (inkl. mobile Ansicht)
 * - Blendet den Header beim Scrollen ein/aus
 * - Verwaltet das Burger-Menü
 */

import { logout, returnRole, returnUserCourses } from "../auth-session.js";
import { getProjectRoot } from "../path-helper.js";

export async function initHeader(root) {
  // root = ShadowRoot oder document
  const ctx = root || document;

  // Header-Inhalt anhand der Benutzerrolle einsetzen
  const content = ctx.getElementById("header-content");

  // Benutzerrolle aus Cookie auslesen (z. B. "student", "lecturer", "partner")
  let user = await returnRole() || "default"; // Fallback

  const templates = window.headerTemplates || {};
  content.innerHTML = templates[user] || [templates["default"]];

  // ===== Kursnummer an bestimmte Links anhängen =====
  try {
    const courseString = await returnUserCourses();
    const courses = JSON.parse(courseString || "[]");

    // nimm den ersten Kurs – oder passe das später an
    const kurs = Array.isArray(courses) ? courses[0] : null;

    if (kurs) {
      // Beispiel: Link auf Vorlesungsplan soll Kurs bekommen
      const courseLinks = ctx.querySelectorAll('[data-append-course="true"]');

      courseLinks.forEach((a) => {
        const base = a.getAttribute("href");
        if (!base) return;

        // Kein ? doppelt anhängen
        const newHref = base.includes("?")
          ? `${base}&course=${kurs}`
          : `${base}?course=${kurs}`;

        a.setAttribute("href", newHref);
      });
    }
  } catch (err) {
    console.warn("[Header] Kursnummer konnte nicht angehängt werden:", err);
  }

  // Links im Header relativ zum Projekt-Root anpassen
  try {
    const rootHref = getProjectRoot();

    const links = ctx.querySelectorAll("a[href]");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (
        href &&
        !href.startsWith("http") &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:")
      ) {
        const url = new URL(href, rootHref);
        link.setAttribute("href", url.pathname + url.search + url.hash);
      }
    });
  } catch (err) {
    console.warn("[Header] Link rewrite failed:", err);
  }

  // ============================
  // Dropdown-Menüs
  // ============================
  const ddContainers = Array.from(ctx.querySelectorAll(".wi-dd"));

  // Schließt alle Dropdown-Menüs außer dem angegebenen
  function closeAllDropdowns(except = null) {
    ddContainers.forEach((c) => {
      const btn = c.querySelector(".btn.primary, .wi-iconbtn");
      const menu = c.querySelector(".wi-dd__menu");
      if (!menu) return;
      if (menu !== except) {
        menu.hidden = true;
        if (btn) {
          btn.setAttribute("aria-expanded", "false");
          btn.classList.remove("is-active");
        }
      }
    });
  }

  // Initial alle Dropdowns schließen
  closeAllDropdowns();

  // Öffnen/Schließen der Dropdowns per Klick
  ddContainers.forEach((container) => {
    const btn = container.querySelector(".btn.primary, .wi-iconbtn");
    const menu = container.querySelector(".wi-dd__menu");
    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      const isMobile = window.matchMedia("(max-width: 84em)").matches;

      if (isMobile) {
        closeAllDropdowns(menu);
        menu.hidden = isOpen;
      } else {
        closeAllDropdowns(isOpen ? null : menu);
        menu.hidden = isOpen;
      }

      btn.setAttribute("aria-expanded", String(!isOpen));
      if (!isOpen && isMobile) btn.classList.add("is-active");
      else btn.classList.remove("is-active");
    });

    // Öffnen per Enter/Leertaste
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // ESC schließt Dropdowns
  ctx.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllDropdowns();
  });

  // ============================
  // Scroll-Hide Header
  // ============================
  const header = ctx.querySelector(".wi-header");
  let lastY = window.scrollY;
  const THRESHOLD = 8;
  let ticking = false;

  function showHeader() {
    header?.classList.remove("is-hidden");
  }
  function hideHeader() {
    header?.classList.add("is-hidden");
  }

  // Header bei Scrollrichtung ein-/ausblenden
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => {
          const delta = y - lastY;
          const doc = document.documentElement;
          const atBottom =
            Math.ceil(window.scrollY + window.innerHeight) >= doc.scrollHeight;

          if (atBottom) showHeader();
          const atTop = y <= 0;

          if (atTop) showHeader();
          else if (Math.abs(delta) > THRESHOLD) {
            delta > 0 ? hideHeader() : showHeader();
            lastY = y;
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // Header bei Scroll nach oben einblenden
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.deltaY < 0) showHeader();
    },
    { passive: true }
  );

  // Header bei Wisch nach oben einblenden
  let touchStartY = null;
  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches?.[0]?.clientY ?? null;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartY == null) return;
      const curY = e.touches[0].clientY;
      if (curY - touchStartY > 10) showHeader();
    },
    { passive: true }
  );

  // Header bei Scroll per Tastatur einblenden
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "PageUp", "Home"].includes(e.key)) showHeader();
  });

  // ============================
  // Burger-Menü
  // ============================
  const burgerBtn = ctx.querySelector(".wi-burgerbtn");
  const nav = ctx.querySelector(".wi-nav");

  // Burger-Menü öffnen/schließen
  if (burgerBtn && nav) {
    burgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = burgerBtn.getAttribute("aria-expanded") === "true";
      burgerBtn.setAttribute("aria-expanded", (!expanded).toString());
      nav.classList.toggle("mobile-open", !expanded);

      // Dropdowns schließen, wenn Menü geöffnet wird
      if (!expanded) closeAllDropdowns();
    });
  }

  // Klick außerhalb schließt Menü und Dropdowns
  document.addEventListener("click", (e) => {
    const path = e.composedPath();
    const clickedInsideShadow = path.includes(ctx);

    if (!clickedInsideShadow) {
      closeAllDropdowns();
      nav?.classList.remove("mobile-open");
      burgerBtn?.setAttribute("aria-expanded", "false");
    }
  });

  // ESC schließt Burger-Menü
  ctx.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav?.classList.contains("mobile-open")) {
      nav.classList.remove("mobile-open");
      burgerBtn?.setAttribute("aria-expanded", "false");
    }
  });

  // ============================
  // Logout-Button
  // ============================
  const logoutLink = ctx.querySelector("#logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await logout(); // Session beenden
        location.reload(); // Seite neu laden
      } catch (err) {
        console.error("Logout fehlgeschlagen:", err);
      }
    });
  }
}
