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
        const savedStep1 = window.storageManager?.getStep?.('step1') || {};
        const savedStep2 = window.storageManager?.getStep?.('step2') || {};
        const savedStep3 = window.storageManager?.getStep?.('step3') || {};

        const selectedFromParams = (() => {
            try { return JSON.parse(params.get("selectedCourses") || "[]"); }
            catch (e) { return []; }
        })();

        Object.entries({
            vorname: savedStep1.vorname,
            nachname: savedStep1.nachname,
            matrikel: savedStep1.matrikel,
            kurs: savedStep1.kurs,
            studiengang: savedStep1.studiengang,
            semester: savedStep1.semester,
            vertiefung: savedStep1.vertiefung,
            zeitraum: savedStep1.zeitraum,
            studiengangsleitung: savedStep1.studiengangsleitung,
        }).forEach(([key, value]) => {
            if (!user[key] && value) user[key] = value;
        });

        if (!user.university && savedStep2?.selectedUniversity?.name) {
            user.university = savedStep2.selectedUniversity.name;
            user.universityId = savedStep2.selectedUniversity.id || user.universityId;
        }

        let semester = parseInt(user.semester || savedStep3.semester, 10) || 1;
        user.semester = semester;

        let selectedCourses = new Set([
            ...(Array.isArray(savedStep3.selectedCourses) ? savedStep3.selectedCourses : []),
            ...selectedFromParams
        ]);


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
        // 9) SELECTED-COURSES LISTE & PERSISTENZ
        // ============================================================
        function persistStep3State() {
            if (!window.storageManager) return;
            window.storageManager.setStep('step3', {
                selectedCourses: Array.from(selectedCourses),
                semester
            });
        }

        function buildPartnerCourseMap() {
            return loadPartnerCourses().reduce((acc, course) => {
                acc[course.id] = course;
                return acc;
            }, {});
        }

        function refreshSelectedCoursesList() {
            const list = qs("#selected-courses-list");
            if (!list) return;

            list.innerHTML = "";

            if (!selectedCourses.size) {
                const li = document.createElement("li");
                li.textContent = "Keine Kurse ausgewählt";
                li.style.opacity = "0.7";
                li.style.fontWeight = "600";
                list.appendChild(li);
                return;
            }

            const partnerMap = buildPartnerCourseMap();

            Array.from(selectedCourses).forEach(id => {
                const course = partnerMap[id];
                if (!course) return;

                const li = document.createElement("li");

                const span = document.createElement("span");
                span.textContent = course.name;

                const remove = document.createElement("button");
                remove.textContent = "✕";
                remove.className = "remove-course";
                remove.onclick = () => {
                    const checkbox = qs(`.partner-select[data-id='${id}']`);
                    if (checkbox) checkbox.checked = false;
                    selectedCourses.delete(id);
                    persistStep3State();
                    updateECTS();
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
            const partnerMap = buildPartnerCourseMap();

            const sum = Array.from(selectedCourses).reduce(
                (total, id) => total + parseFloat(partnerMap[id]?.ects || 0),
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

            refreshSelectedCoursesList();
            persistStep3State();
        }

        function handlePartnerToggle(courseId, checked) {
            if (checked) selectedCourses.add(courseId);
            else selectedCourses.delete(courseId);
            updateECTS();
        }

        function mergeParamsWithState(baseParams = new URLSearchParams()) {
            const merged = new URLSearchParams(baseParams.toString());
            const mapping = {
                vorname: user.vorname,
                nachname: user.nachname,
                matrikel: user.matrikel,
                kurs: user.kurs,
                studiengang: user.studiengang,
                semester: semester,
                vertiefung: user.vertiefung,
                zeitraum: user.zeitraum,
                studiengangsleitung: user.studiengangsleitung
            };

            Object.entries(mapping).forEach(([key, value]) => {
                if (value) merged.set(key, value);
            });

            const selectedUni = savedStep2?.selectedUniversity;
            if (selectedUni) {
                merged.set('university', selectedUni.name || user.university || '');
                if (selectedUni.id) merged.set('universityId', selectedUni.id);
            }

            return merged;
        }


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
                cb.checked = selectedCourses.has(c.id);
                cb.addEventListener('change', () => handlePartnerToggle(c.id, cb.checked));

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

            const newParams = mergeParamsWithState(new URLSearchParams(window.location.search));
            newParams.set("selectedCourses", JSON.stringify(Array.from(selectedCourses)));

            window.location.href = "./step4.html?" + newParams.toString();
        });

        const backToStep2Link = qs("#back") || qs("#back-to-step2");
        if (backToStep2Link) {
            const paramsForBack = mergeParamsWithState(new URLSearchParams(window.location.search));
            paramsForBack.delete("selectedCourses");
            backToStep2Link.href = "./step2.html?" + paramsForBack.toString();
        }


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
                persistStep3State();
            }
        });

    });

})();