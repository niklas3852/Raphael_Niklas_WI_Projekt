import { cities } from "../db/university_data/cities.js";

(function () {

    function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
    function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

    document.addEventListener("DOMContentLoaded", () => {

        // ============================================================
        // 1) URL PARAMETER LADEN
        // ============================================================
        const params = new URLSearchParams(window.location.search);

        const user = {
            vorname: params.get("vorname") || "",
            nachname: params.get("nachname") || "",
            matrikel: params.get("matrikel") || "",
            kurs: params.get("kurs") || "",
            studiengang: params.get("studiengang") || "",
            semester: params.get("semester") || "1",
            vertiefung: params.get("vertiefung") || "",
            zeitraum: params.get("zeitraum") || "",
            studiengangsleitung: params.get("studiengangsleitung") || "",
            university: params.get("university") || "",
            universityId: params.get("universityId") || ""
        };

        let semester = parseInt(user.semester, 10) || 1;


        // ============================================================
        // 2) DATENBANKEN LADEN
        // ============================================================
        const dhbwDefs = window.dhbwCourses || {};
        const partnerDefs = window.compatibleCourses || {};

        const studiengangId = user.studiengang;
        const studiengangName =
            dhbwDefs[studiengangId]?.name ||
            user.studiengang ||
            "Studiengang unbekannt";


        // ============================================================
        // 3) PARTNERUNIVERSITÄT (URL)
        // ============================================================
        let partnerKey = null;

        if (user.universityId && partnerDefs[user.universityId]) {
            partnerKey = user.universityId;
        } else {
            partnerKey = Object.keys(partnerDefs).find(
                k => partnerDefs[k].name.toLowerCase() === user.university.toLowerCase()
            ) || null;
        }

        if (!partnerKey) partnerKey = Object.keys(partnerDefs)[0] || null;

        const partner = partnerDefs[partnerKey];


        // ============================================================
        // 4) DOM ELEMENTE
        // ============================================================
        const dhbwTbl = qs("#dhbw-table tbody");
        const partnerTbl = qs("#partner-table tbody");
        const partnerTitle = qs("#partner-title");

        const dhbwEctsEl = qs("#dhbw-ects");
        const partnerEctsEl = qs("#partner-ects");

        const ectsRequiredEl = qs("#ects-required");
        const ectsRemainingEl = qs("#ects-remaining");
        const ectsRequiredDup = qs("#ects-required-dup");
        const ectsRemainingDup = qs("#ects-remaining-dup");

        const ectsPercentEl = qs("#ects-percent");
        const ectsProgress = qs("#ects-progress");

        const warningEl = qs(".limit-warning");
        const toStep4Btn = qs("#to-step4");

        const bannerFullname = qs("#user-fullname");
        const bannerDetails = qs("#banner-details");

        const paginationContainer = qs("#partner-pagination");


        // ============================================================
        // 5) BANNER
        // ============================================================
        if (bannerFullname)
            bannerFullname.textContent = `${user.vorname} ${user.nachname}`.trim();

        if (bannerDetails) {
            bannerDetails.innerHTML = `
                <strong>Studiengang:</strong> ${studiengangName}<br>
                <strong>Semester:</strong> ${semester}<br>
                <strong>Gastuniversität:</strong> ${partner?.name || user.university}<br>
                Zeitraum: ${user.zeitraum}
            `;
        }

        if (partnerTitle) partnerTitle.textContent = partner?.name || user.university;


        // ============================================================
        // 6) DHBW-Kurse
        // ============================================================
        function loadDHBWCourses() {
            return dhbwDefs[studiengangId]?.semesters?.[String(semester)] || [];
        }


        // ============================================================
        // 7) Partner-Kurse (für Pagination)
        // ============================================================
        function loadPartnerCourses() {
            return partner?.semesters?.[String(semester)] || [];
        }

        let partnerPage = 1;
        const PARTNER_PAGE_SIZE = 8;


        // ============================================================
        // 8) CITY-WELCOME
        // ============================================================
        function findCity() {
            const id = user.universityId;
            const name = user.university.toLowerCase();

            return (
                cities.find(c => c.id === id) ||
                cities.find(c => c.name.toLowerCase() === name) ||
                null
            );
        }

        let welcomeContainer = qs("#welcome-city-container");
        if (!welcomeContainer) {
            const banner = qs(".modules-banner");
            welcomeContainer = document.createElement("div");
            welcomeContainer.id = "welcome-city-container";
            welcomeContainer.style.display = "none";
            welcomeContainer.innerHTML = `
                <h2 id="welcome-text"></h2>
                <section id="sway-gallery"><main><div id="gallery"></div></main></section>
            `;
            banner?.parentNode?.insertBefore(welcomeContainer, banner.nextSibling);
        }

        function showWelcome(city) {
            if (!city) return;
            welcomeContainer.style.display = "block";

            const welcomeTextEl = qs("#welcome-text");
            const galleryEl = qs("#gallery");

            galleryEl.innerHTML = "";
            if (city.gallery?.length) {
                city.gallery.forEach(item => {
                    const fig = document.createElement("figure");
                    const img = document.createElement("img");
                    img.src = item.img;
                    img.alt = item.caption || city.name;
                    const cap = document.createElement("figcaption");
                    cap.textContent = item.caption || "";
                    fig.appendChild(img);
                    fig.appendChild(cap);
                    galleryEl.appendChild(fig);
                });
            }

            const base = city.welcome || "Willkommen";
            const cityName = city.name.split(",")[0];

            let txt = `${base} in ${cityName}`;
            if (base !== "Willkommen") txt = `${base} (Willkommen) in ${cityName}`;

            let i = 0;
            welcomeTextEl.textContent = "";
            function type() {
                if (i < txt.length) {
                    welcomeTextEl.textContent += txt[i++];
                    setTimeout(type, 80);
                }
            }
            type();
        }


        // ============================================================
        // 9) SELECTED-COURSES LISTE
        // ============================================================
        function refreshSelectedCoursesList() {
            const list = qs("#selected-courses-list");
            if (!list) return;

            list.innerHTML = "";
            const selected = qsa(".partner-select").filter(cb => cb.checked);

            if (selected.length === 0) {
                const li = document.createElement("li");
                li.textContent = "Keine Kurse ausgewählt";
                li.style.opacity = "0.7";
                li.style.fontWeight = "600";
                list.appendChild(li);
                return;
            }

            selected.forEach(cb => {
                const row = cb.closest("tr");
                const nameCell = row.querySelector("td");

                const plain = Array.from(nameCell.childNodes)
                    .filter(n => n.nodeType === 3)
                    .map(n => n.textContent.trim())
                    .join(" ");

                const li = document.createElement("li");

                const span = document.createElement("span");
                span.textContent = plain;

                const remove = document.createElement("button");
                remove.textContent = "✕";
                remove.className = "remove-course";
                remove.onclick = () => {
                    cb.checked = false;
                    cb.dispatchEvent(new Event("change", { bubbles: true }));
                };

                li.appendChild(span);
                li.appendChild(remove);
                list.appendChild(li);
            });
        }


        // ============================================================
        // 10) ECTS-BERECHNUNG
        // ============================================================
        function updateECTS() {
            const required = parseFloat(ectsRequiredEl.textContent) || 30;
            const selected = qsa(".partner-select").filter(cb => cb.checked);

            const sum = selected.reduce(
                (a, b) => a + parseFloat(b.dataset.ects || 0),
                0
            );

            partnerEctsEl.textContent = sum;

            const remaining = Math.max(0, required - sum);
            ectsRemainingEl.textContent = remaining;
            if (ectsRemainingDup) ectsRemainingDup.textContent = remaining;

            const pct = Math.min(100, Math.round((sum / required) * 100));
            ectsProgress.style.width = pct + "%";
            ectsPercentEl.textContent = pct + "%";

            if (warningEl) {
                if (sum < required) {
                    warningEl.style.display = "block";
                    warningEl.textContent = `Es fehlen noch ${remaining} ECTS`;
                } else {
                    warningEl.style.display = "none";
                }
            }

            if (sum >= required) {
                toStep4Btn.classList.remove("disabled");
            } else {
                toStep4Btn.classList.add("disabled");
            }
        }

        const originalUpdateECTS = updateECTS;
        updateECTS = function () {
            originalUpdateECTS();
            refreshSelectedCoursesList();
        };


        // ============================================================
        // 11) PARTNER-TABELLE MIT PAGINATION
        // ============================================================
        function renderPartnerPagination(total) {
            const totalPages = Math.ceil(total / PARTNER_PAGE_SIZE);

            paginationContainer.innerHTML = "";

            if (totalPages <= 1) return;

            const prev = document.createElement("button");
            prev.textContent = "←";
            prev.disabled = partnerPage === 1;
            prev.onclick = () => {
                partnerPage--;
                renderPartnerTable();
            };

            const next = document.createElement("button");
            next.textContent = "→";
            next.disabled = partnerPage === totalPages;
            next.onclick = () => {
                partnerPage++;
                renderPartnerTable();
            };

            const info = document.createElement("span");
            info.textContent = `Seite ${partnerPage} / ${totalPages}`;

            paginationContainer.appendChild(prev);
            paginationContainer.appendChild(info);
            paginationContainer.appendChild(next);
        }

        function renderPartnerTable() {
            const all = loadPartnerCourses();
            partnerTbl.innerHTML = "";

            const total = all.length;
            const start = (partnerPage - 1) * PARTNER_PAGE_SIZE;
            const end = start + PARTNER_PAGE_SIZE;

            const pageItems = all.slice(start, end);

            pageItems.forEach(c => {
                const tr = document.createElement("tr");

                const cb = document.createElement("input");
                cb.type = "checkbox";
                cb.dataset.id = c.id;
                cb.dataset.ects = c.ects;
                cb.className = "partner-select";
                cb.onchange = updateECTS;

                tr.innerHTML = `
                    <td data-label="Kurs">${c.name}</td>
                    <td data-label="Beschreibung">${c.description}</td>
                    <td data-label="ECTS" class="ects">${c.ects}</td>
                `;

                const td = document.createElement("td");
                td.appendChild(cb);
                tr.appendChild(td);

                partnerTbl.appendChild(tr);
            });

            renderPartnerPagination(total);
            updateECTS();
        }


        // ============================================================
        // 12) DHBW-TABELLE
        // ============================================================
        function renderDHBWTable() {
            const dhbwCourses = loadDHBWCourses();
            dhbwTbl.innerHTML = "";

            let sum = 0;
            dhbwCourses.forEach(c => {
                sum += c.ects || 0;
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td data-label="Kurs">${c.name}</td>
                    <td data-label="Beschreibung">${c.description}</td>
                    <td data-label="ECTS" class="ects">${c.ects}</td>
                `;
                dhbwTbl.appendChild(tr);
            });

            dhbwEctsEl.textContent = sum;
            ectsRequiredEl.textContent = sum;
            if (ectsRequiredDup) ectsRequiredDup.textContent = sum;
        }


        // ============================================================
        // 13) NACH STEP 4 WEITERLEITEN
        // ============================================================
        toStep4Btn.addEventListener("click", e => {
            if (toStep4Btn.classList.contains("disabled")) {
                e.preventDefault();
                return;
            }

            const selected = qsa(".partner-select")
                .filter(cb => cb.checked)
                .map(cb => cb.dataset.id);

            const newParams = new URLSearchParams(window.location.search);
            newParams.set("selectedCourses", JSON.stringify(selected));

            window.location.href = "./step4.html?" + newParams.toString();
        });

        document.addEventListener("DOMContentLoaded", () => {

            qs("#back-to-step2")?.addEventListener("click", () => {
                const params = new URLSearchParams(window.location.search);
                params.delete("selectedCourses");
                params.delete("semester");
                window.location.href = "./step2.html?" + params.toString();
            });
        });


        // ============================================================
        // 14) INIT
        // ============================================================
        renderDHBWTable();
        renderPartnerTable();
        showWelcome(findCity());

        document.addEventListener("keydown", e => {
            if (e.key >= "1" && e.key <= "6") {
                semester = parseInt(e.key, 10);
                user.semester = semester;
                partnerPage = 1;
                renderDHBWTable();
                renderPartnerTable();
            }
        });

    });

})();