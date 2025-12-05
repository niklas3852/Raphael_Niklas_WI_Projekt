import { cities } from '../db/university_data/cities.js';
import { continents } from '../db/university_data/continents.js';
import { initPageLoader, waitForImages } from './loading-overlay.js';
import { createUrlWithState, loadState, updateState } from './shared-state.js';

const welcomeTextEl = document.getElementById("welcome-text");
const welcomeContainer = document.getElementById("welcome-city-container");
const cityListEl = document.getElementById("city-list");
const searchInput = document.getElementById("city-search");
const globeContainer = document.getElementById("globe-container");
const paginationEl = document.createElement("div");
paginationEl.className = "pagination";
cityListEl.insertAdjacentElement("afterend", paginationEl);

const backLink = document.querySelector('.step1-nav #back');

const appState = loadState();
let selectedUniversity = appState.selectedUniversity || null;

if (backLink) {
    backLink.href = createUrlWithState('./step1.html', appState);
}

const continentWrapper = document.createElement("div");
continentWrapper.id = "continent-result-wrapper";

const continentContainer = document.createElement("div");
continentContainer.className = "continent-filter";

const resultCountEl = document.createElement("div");
resultCountEl.id = "result-count";

const divider = document.createElement("hr");
divider.className = "continent-divider";

function updateResultCount() {
    const visibleTiles = Array.from(document.querySelectorAll(".city-tile"))
        .filter(tile => !tile.classList.contains("hidden"));
    const totalTiles = document.querySelectorAll(".city-tile").length;
    resultCountEl.textContent = `${visibleTiles.length} von ${totalTiles} Universitäten`;
}

continentWrapper.appendChild(continentContainer);
continentWrapper.appendChild(divider);
continentWrapper.appendChild(resultCountEl);

searchInput.insertAdjacentElement("afterend", continentWrapper);

continentContainer.className = "continent-filter";
searchInput.insertAdjacentElement("afterend", continentContainer);

let debounceTimer;
const tileWidth = 220;
const tileHeight = 280;
const gap = 12;
let activeContinent = null;
const ROWS_PER_PAGE = 2;

let activePage = 1;
let totalPages = 1;

const pageLoader = initPageLoader({
    message: 'Wir laden alle Gasthochschulen...',
    subline: 'Globus und Kartenbilder werden vorbereitet.',
    imageScope: null
});

const finalizeLoader = () => pageLoader.finish([
    globeContainer ? waitForImages(globeContainer) : null,
    cityListEl ? waitForImages(cityListEl) : null
]);

if (document.readyState === "complete") {
    finalizeLoader();
} else {
    window.addEventListener("load", finalizeLoader, { once: true });
}

// ------------------- Hilfsfunktionen -------------------
function createAccordionItem(title, content) {
    return `
        <div class="accordion-item">
            <div class="accordion-header">
                <span class="accordion-title">${title}</span>
                <span class="accordion-icon">▾</span>
            </div>
            <div class="accordion-content">
                <p>${content}</p>
            </div>
        </div>
    `;
}

// ------------------- Hilfsfunktionen -------------------
// ... (createAccordionItem bleibt gleich)

function setupAccordion() {
    document.querySelectorAll(".accordion-item").forEach(item => {
        const header = item.querySelector(".accordion-header");
        header.addEventListener("click", () => {
            // Finde offenes Akkordeon und schließe es, falls es nicht das geklickte ist
            document.querySelectorAll(".accordion-header.open").forEach(openHeader => {
                if (openHeader !== header) closeAccordion(openHeader);
            });
            // Öffne oder schließe das geklickte Akkordeon
            if (header.classList.contains("open")) closeAccordion(header);
            else openAccordion(header);
        });
    });
}

function openAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector(".accordion-icon");

    // 1. Klasse 'open' hinzufügen
    header.classList.add("open");
    icon.style.transform = "rotate(180deg)";

    // 2. Setze maxHeight auf die tatsächliche Scroll-Höhe für die Transition
    // Die .accordion-content muss im CSS 'max-height: 0' und eine 'transition' haben.
    content.style.maxHeight = content.scrollHeight + "px";

    // 3. Optional: Wenn die Transition abgeschlossen ist, maxHeight auf 'none' setzen.
    // Dies ist *nur* sinnvoll, wenn sich der Inhalt dynamisch ändert.
    // Aber für die Standard-Accordion-Funktionalität *lasse ich es hier weg*,
    // da es die Transition beim Schließen erschwert (es müsste dann wieder auf scrollHeight gesetzt werden).
    // => Wir lassen die maxHeight einfach auf scrollHeight, das ist der sauberste Weg.
}

function closeAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector(".accordion-icon");

    // 1. Zuerst die aktuelle Höhe holen und setzen (falls 'maxHeight' gerade 'none' war - in Ihrem alten Code passierte das).
    // Im neuen, verbesserten Code (der maxHeight auf scrollHeight lässt) ist dieser Schritt weniger kritisch,
    // aber schadet nicht, um einen sauberen Startpunkt für die Transition zu haben.
    // WICHTIG: Wenn der Inhalt bereits vollständig sichtbar ist (maxHeight > scrollHeight oder 'none'),
    // dann auf scrollHeight setzen, bevor auf 0 gesetzt wird.
    content.style.maxHeight = content.scrollHeight + "px";
    content.offsetHeight; // Forciert einen Reflow, damit die neue Höhe angewandt wird.

    // 2. Klasse 'open' entfernen
    header.classList.remove("open");
    icon.style.transform = "rotate(0deg)";

    // 3. Auf 0 reduzieren (startet die Transition)
    content.style.maxHeight = "0";

    // Beim Schließen gibt es keinen Timeout mehr, das CSS macht die Arbeit.
    return Promise.resolve();
}

// ... (Rest des JavaScript-Codes bleibt gleich)

// ------------------- Stadt-Kacheln -------------------
function renderCities() {
    cityListEl.innerHTML = "";
    cityListEl.style.position = "relative";

    // ✨ NEU: Städte alphabetisch nach Name sortieren
    cities.sort((a, b) => a.name.localeCompare(b.name));

    cities.forEach((city) => {
        const tile = document.createElement("div");
        tile.className = "city-tile floating-tile";
        tile.style.width = `${tileWidth}px`;
        tile.style.height = `${tileHeight}px`;
        tile.style.position = "absolute";
        tile.innerHTML = `
            <div class="city-image-wrapper">
                <img src="${city.img}" alt="${city.name}">
                <div class="temperature-box" id="temp-${city.name}">Lädt...</div>
            </div>
            <div class="city-name">${city.name}</div>
            <div class="city-country">${city.country}</div>
        `;
        tile.addEventListener("click", () => showCityInfo(city));
        cityListEl.appendChild(tile);
        fetchTemperature(city);
    });

    updatePagination();
    layoutTiles(Array.from(document.querySelectorAll(".city-tile")));
}

function updatePagination() {
    const tiles = Array.from(document.querySelectorAll(".city-tile"));
    const colCount = updateColCount();
    const visibleTiles = tiles.filter(tile => !tile.classList.contains("hidden"));
    const maxTilesPerPage = colCount * ROWS_PER_PAGE;
    totalPages = Math.ceil(visibleTiles.length / maxTilesPerPage);
    activePage = 1;
    renderPaginationControls();
}

function renderPaginationControls() {
    paginationEl.innerHTML = "";

    updateResultCount();

    // Keine Pagination anzeigen, wenn alle Tiles auf eine Seite passen
    if (totalPages <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "← Zurück";
    prevBtn.className = "pagination-btn";
    prevBtn.disabled = activePage === 1;
    prevBtn.addEventListener("click", () => {
        if (activePage > 1) {
            activePage--;
            layoutTiles(Array.from(document.querySelectorAll(".city-tile")));
        }
    });

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Weiter →";
    nextBtn.className = "pagination-btn";
    nextBtn.disabled = activePage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (activePage < totalPages) {
            activePage++;
            layoutTiles(Array.from(document.querySelectorAll(".city-tile")));
        }
    });

    const pageIndicator = document.createElement("span");
    pageIndicator.className = "page-indicator";
    pageIndicator.textContent = `${activePage} / ${totalPages}`;

    paginationEl.appendChild(prevBtn);
    paginationEl.appendChild(pageIndicator);
    paginationEl.appendChild(nextBtn);
}

// ------------------- Layout -------------------
function updateColCount() {
    const width = window.innerWidth;
    if (width > 1200) return 3;
    if (width > 768) return 2;
    return 1;
}

function layoutTiles(tiles) {
    const containerWidth = cityListEl.clientWidth;
    const colCount = updateColCount();
    const visibleTiles = tiles.filter(tile => !tile.classList.contains("hidden"));
    const maxTilesPerPage = colCount * ROWS_PER_PAGE;

    updateResultCount();

    // Seitenberechnung
    totalPages = Math.ceil(visibleTiles.length / maxTilesPerPage);
    activePage = Math.min(activePage, totalPages || 1);

    // Nur die sichtbaren Tiles pro Seite anzeigen
    const startIdx = (activePage - 1) * maxTilesPerPage;
    const endIdx = startIdx + maxTilesPerPage;
    visibleTiles.forEach((tile, idx) => {
        tile.style.display = (idx >= startIdx && idx < endIdx) ? "block" : "none";
    });

    // Layout Positionierung
    const pageTiles = visibleTiles.slice(startIdx, endIdx);
    const rowCount = Math.ceil(pageTiles.length / colCount); // ⚡ dynamisch statt fix 3
    const maxTileWidth = Math.min(tileWidth, (containerWidth - (colCount - 1) * gap) / colCount);

    for (let r = 0; r < rowCount; r++) {
        const rowTiles = pageTiles.slice(r * colCount, (r + 1) * colCount);
        const rowWidth = rowTiles.length * maxTileWidth + (rowTiles.length - 1) * gap;
        const startLeft = Math.max((containerWidth - rowWidth) / 2, 0);

        rowTiles.forEach((tile, i) => {
            tile.style.transition = "all 0.5s ease";
            tile.style.width = `${maxTileWidth}px`;
            tile.style.left = `${startLeft + i * (maxTileWidth + gap)}px`;
            tile.style.top = `${r * (tileHeight + gap)}px`;
        });
    }

    // ✨ Containerhöhe richtet sich nach der tatsächlichen Anzahl Reihen (abhängig von ROWS_PER_PAGE)
    cityListEl.style.height = `${rowCount * (tileHeight + gap) - gap}px`;

    renderPaginationControls();
}

// ------------------- Filter -------------------
function filterCitiesByName(filter) {
    const tiles = Array.from(document.querySelectorAll(".city-tile"));
    const lowerFilter = filter.toLowerCase();

    const filtered = tiles.filter(tile => {
        const name = tile.querySelector(".city-name").textContent.toLowerCase();
        const country = tile.querySelector(".city-country").textContent.toLowerCase();
        return name.includes(lowerFilter) || country.includes(lowerFilter);
    });

    tiles.forEach(tile => filtered.includes(tile) ? tile.classList.remove("hidden") : tile.classList.add("hidden"));
    layoutTiles(tiles);
}

const style = document.createElement('style');
style.textContent = `
.floating-tile {
    animation: floatAnim 6s ease-in-out infinite;
}
@keyframes floatAnim {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
    100% { transform: translateY(0px); }
}
`;
document.head.appendChild(style);

function filterCitiesByContinent(continent) {
    const tiles = Array.from(document.querySelectorAll(".city-tile"));
    tiles.forEach(tile => {
        const city = cities.find(c => c.name === tile.querySelector(".city-name").textContent);
        if (!continent || (city && city.continent === continent)) tile.classList.remove("hidden");
        else tile.classList.add("hidden");
    });
    layoutTiles(tiles);
}

searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => filterCitiesByName(searchInput.value), 150);
});

function renderContinents() {
    continentContainer.innerHTML = "";
    continents.forEach(cont => {
        const box = document.createElement("div");
        box.className = "continent-box";
        box.style.backgroundImage = `url('${cont.img}')`;
        box.style.backgroundSize = "cover";
        box.style.backgroundPosition = "center";
        box.style.position = "relative";

        const text = document.createElement("span");
        text.textContent = cont.name;
        box.appendChild(text);

        box.addEventListener("click", () => {
            if (activeContinent === cont.name) {
                activeContinent = null;
                box.style.filter = "";
                filterCitiesByContinent(null);
            } else {
                activeContinent = cont.name;
                document.querySelectorAll(".continent-box").forEach(b => b.style.filter = "");
                box.style.filter = "grayscale(40%) brightness(75%)";
                filterCitiesByContinent(cont.name);
            }
        });
        continentContainer.appendChild(box);
    });
}

function exitCityDetail() {
    const globeLayout = document.querySelector('.globe-city-layout');
    globeLayout?.classList.remove("active");

    if (welcomeContainer) {
        welcomeContainer.style.display = "none";
        const galleryEl = document.getElementById("gallery");
        if (galleryEl) galleryEl.innerHTML = "";
    }

    const infoEl = document.getElementById("city-info");
    if (infoEl) {
        infoEl.style.display = "none";
        infoEl.innerHTML = "";
    }

    cityListEl.style.display = "grid";
    paginationEl.style.display = "flex";
    searchInput.style.display = "block";
    continentContainer.style.display = "flex";

    selectedUniversity = null;
    updateState(prev => ({ ...prev, selectedUniversity: null }));

    const step1Nav = document.querySelector('.step1-nav');
    if (step1Nav) step1Nav.style.display = 'flex';

    const step2Nav = document.querySelector('.step2-nav');
    if (step2Nav) step2Nav.style.display = 'none';
}

function showCityInfo(city) {
    document.body.classList.add("showing-city-info");

    // Markiere die aktuell ausgewählte Universität global
    try {
        window._la_selected_university = city;
    } catch (e) {
        // ignore
    }

    function smoothScrollToTop(duration = 1200) {
        const start = window.scrollY || document.documentElement.scrollTop;
        const startTime = performance.now();

        function scroll() {
            const now = performance.now();
            const time = Math.min((now - startTime) / duration, 1);
            const ease = time < 0.5
                ? 4 * time * time * time
                : 1 - Math.pow(-2 * time + 2, 3) / 2;
            const scrollY = start * (1 - ease);
            window.scrollTo(0, scrollY);
            if (time < 1) requestAnimationFrame(scroll);
        }
        requestAnimationFrame(scroll);
    }

    smoothScrollToTop(1200);

    const globeLayout = document.querySelector('.globe-city-layout');
    globeLayout.style.backgroundImage = `url('${city.city_background_image || city.img}')`;
    globeLayout.classList.add("active");

    // Andere Elemente verstecken
    cityListEl.style.display = "none";
    paginationEl.style.display = "none";
    searchInput.style.display = "none";
    continentContainer.style.display = "none";

    const quotesContainer = document.getElementById("student-quotes-container");
    quotesContainer.innerHTML = "";
    city.studentQuotes.forEach((item, index) => {
        const quoteEl = document.createElement("div");
        quoteEl.className = `student-quote ${index % 2 === 0 ? 'left' : 'right'}`;
        quoteEl.innerHTML = `
            <span class="quote-text">"${item.quote}"</span>
            <span class="quote-author">${item.author}</span>
        `;
        quotesContainer.appendChild(quoteEl);
    });

    if (welcomeContainer) {
        welcomeContainer.style.display = "block";
        welcomeTextEl.textContent = "";

        const cityName = city.country.split(",")[0].trim();
        const welcomeBase = city.welcome;
        const showBracket = welcomeBase !== "Willkommen";
        const fullText = showBracket
            ? `${welcomeBase} (Willkommen) in ${cityName}`
            : `${welcomeBase} in ${cityName}`;

        const galleryEl = document.getElementById("gallery");
        if (galleryEl) {
            galleryEl.innerHTML = "";
            if (city.gallery && city.gallery.length > 0) {
                city.gallery.forEach(item => {
                    const fig = document.createElement("figure");
                    const img = document.createElement("img");
                    img.src = item.img;
                    img.alt = item.caption;
                    const cap = document.createElement("figcaption");
                    cap.textContent = item.caption;
                    fig.appendChild(img);
                    fig.appendChild(cap);
                    galleryEl.appendChild(fig);
                });
            } else {
                galleryEl.innerHTML = "<p>Für diese Stadt sind derzeit leider keine Bilder verfügbar.</p>";
            }
        }

        let index = 0;
        function typeText() {
            if (index < fullText.length) {
                welcomeTextEl.textContent += fullText.charAt(index);
                index++;
                setTimeout(typeText, 80);
            }
        }
        typeText();
    }

    // Karussells oder Lightboxes entfernen
    document.querySelectorAll(".carousel, .carousel-wrapper, #global-carousel").forEach(el => el.remove());
    document.querySelectorAll(".lightbox-overlay, #global-lightbox").forEach(el => el.remove());

    // City-Info Container vorbereiten
    let infoEl = document.getElementById("city-info");
    infoEl.innerHTML = `
        <div class="info-header">
            <button class="back-btn">← Zurück</button>
            <h3>${city.name}</h3>
        </div>
        <p class="city-location">${city.country}</p>
        <p class="city-desc">${city.info}</p>

        <div class="accordion-container">
            ${createAccordionItem("Studiengänge von bisherigen DHBW-Studierenden", city.dhbwStudents.join(", "))}
            ${createAccordionItem("Kontaktmöglichkeiten", city.contact)}
            ${createAccordionItem("Leben in " + city.country.split(",")[0], city.living)}
            ${createAccordionItem("Semesterzeiten", city.semesterDates)}
        </div>
    `;

    // Navigation-Buttons unter City-Info
    const navButtons = document.querySelector(".step-navigation-buttons");
    navButtons.style.display = "flex";
    navButtons.style.marginTop = "20px";
    const nextBtn = navButtons.querySelector("#next");
    if (nextBtn) nextBtn.textContent = `Fortfahren mit der ${city.name}`;

    // Globus-Marker / Route setzen
    if (window.setGlobeMarker) window.setGlobeMarker(city.latitude, city.longitude, { size: 2.5, color: 'red', title: city.name, altitude: 1.5 });
    if (window.setGlobeRoute) window.setGlobeRoute(city.latitude, city.longitude, { color: 'black', altitude: 0.6 });

    setupAccordion();

    // 🔹 Back-Button: zurück zur Auswahl
    const backBtn = infoEl.querySelector(".back-btn");
    backBtn.addEventListener("click", exitCityDetail);

    infoEl.style.display = "flex";
    infoEl.style.flexDirection = "column";

    selectUniversity(city);
}

function selectUniversity(city) {
    // ----------------------------------------------------
    // UI – Navigation & Button wie bisher
    // ----------------------------------------------------
    const step1Nav = document.querySelector('.step1-nav');
    if (step1Nav) step1Nav.style.display = 'none';

    const step2Nav = document.querySelector('.step2-nav');
    if (step2Nav) step2Nav.style.display = 'flex';

    const continueBtn = document.getElementById('continue-with-university');
    if (continueBtn) {
        continueBtn.textContent = `Fortfahren mit der ${city.name}`;
        continueBtn.onclick = () => {
            const nextState = updateState(prev => ({
                ...prev,
                selectedUniversity: city
            }));
            window.laAllowUnload = true;
            window.location.href = createUrlWithState("./step3.html", nextState);
        };
    }

    selectedUniversity = city;
    updateState(prev => ({ ...prev, selectedUniversity: city }));
}

// ------------------- Temperatur -------------------
async function fetchTemperature(city) {
    const apiKey = '0539ab8029a2a26c5614d181cd73722a';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.latitude}&lon=${city.longitude}&appid=${apiKey}&units=metric&lang=de`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fehler bei der API-Anfrage');
        const data = await response.json();
        const temperature = data.main.temp;
        const tempEl = document.getElementById(`temp-${city.name}`);
        if (tempEl) tempEl.textContent = `${temperature.toFixed(1)}°C`;
    } catch (e) {
        console.error(e);
        const tempEl = document.getElementById(`temp-${city.name}`);
        if (tempEl) tempEl.textContent = "N/A";
    }
}

// ------------------- GLOBAL CAROUSEL -------------------
const globalCarouselEl = document.getElementById("global-carousel");
const globalLightbox = document.getElementById("global-lightbox");
const globalLightboxImg = document.getElementById("globalLightboxImg");
const globalCloseBtn = document.getElementById("globalCloseBtn");

let globalImages = cities.map(c => c.img);
let currentIndex = 0;
let carouselInterval = null;

function setupGlobalCarousel(images = globalImages) {
    globalCarouselEl.innerHTML = "";
    images.forEach((src, i) => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.index = i;
        card.style.backgroundImage = `url('${src}')`;
        card.style.transition = "transform 0.5s ease, opacity 0.5s ease";
        globalCarouselEl.appendChild(card);
    });

    createCarouselControls();  // 🔸 NEU: Buttons einfügen
    updateCarouselPositions();
    startCarouselRotation();
}

function updateCarouselPositions() {
    const cards = Array.from(globalCarouselEl.children).filter(el => el.classList.contains("card"));
    const len = cards.length;
    cards.forEach((card, i) => {
        const pos = ((i - currentIndex + len) % len);
        card.dataset.pos = 0;
        card.style.zIndex = 1;
        card.style.opacity = 0;
        card.style.transform = "translateX(0) scale(0.7) rotateY(0deg)";
        if (pos === 0) {
            card.dataset.pos = 0;
            card.style.zIndex = 10;
            card.style.opacity = 1;
            card.style.transform = "translateX(0) scale(1) translateZ(60px)";
        } else if (pos === 1) {
            card.dataset.pos = 1;
            card.style.zIndex = 5;
            card.style.opacity = 0.85;
            card.style.transform = "translateX(120px) scale(0.9) rotateY(-20deg)";
        } else if (pos === len - 1) {
            card.dataset.pos = -1;
            card.style.zIndex = 5;
            card.style.opacity = 0.85;
            card.style.transform = "translateX(-120px) scale(0.9) rotateY(20deg)";
        }
    });
}

function rotateCarousel() {
    currentIndex = (currentIndex + 1) % globalImages.length;
    updateCarouselPositions();
}

function startCarouselRotation() {
    stopCarouselRotation();
    carouselInterval = setInterval(rotateCarousel, 3000);
}

function stopCarouselRotation() {
    if (carouselInterval) clearInterval(carouselInterval);
}

function closeGlobalLightbox() {
    globalLightbox.classList.remove("active");
    setTimeout(() => (globalLightboxImg.src = ""), 300);
}
globalLightbox.addEventListener("click", (e) => {
    if (e.target === globalLightbox || e.target === globalCloseBtn) closeGlobalLightbox();
});

// ------------------- Steuerungsbuttons unter dem Karussell -------------------
function createCarouselControls() {
    let controlContainer = document.getElementById("carousel-controls");
    if (!controlContainer) {
        controlContainer = document.createElement("div");
        controlContainer.id = "carousel-controls";

        const buttons = [
            { text: "⏸ Pause", action: stopCarouselRotation },
            { text: "▶️ Weiter", action: startCarouselRotation },
            { text: "⏭ Nächstes Bild", action: () => { rotateCarousel(); stopCarouselRotation(); } }
        ];

        buttons.forEach(({ text, action }) => {
            const btn = document.createElement("button");
            btn.textContent = text;
            btn.className = "carousel-btn";
            btn.addEventListener("click", action);
            controlContainer.appendChild(btn);
        });

        document.getElementById("global-carousel-wrapper").appendChild(controlContainer);
    }
}

function restoreSelectionFromState() {
    if (!selectedUniversity) return;
    const match = cities.find(c => c.id === selectedUniversity.id || c.name === selectedUniversity.name);
    if (match) showCityInfo(match);
}
// ------------------- INIT -------------------
renderCities();
renderContinents();
setupGlobalCarousel();
restoreSelectionFromState();
window.addEventListener("resize", () => layoutTiles(Array.from(document.querySelectorAll(".city-tile"))));
window.addEventListener("resize", () => layoutTiles(Array.from(document.querySelectorAll(".city-tile"))));
