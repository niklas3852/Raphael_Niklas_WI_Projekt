// =======================================================
// STEP 4 – Learning Agreement Vorschau (URL-basierte Daten)
// Behält 100% das Layout der alten Version bei!
// =======================================================

(function () {

    function qs(sel, ctx) { return (ctx || document).querySelector(sel); }

    document.addEventListener("DOMContentLoaded", () => {

        // ----------------------------------------------------------
        // 1) URL PARAMETER LADEN
        // ----------------------------------------------------------
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
            universityId: params.get("universityId") || "",
            selectedCourses: JSON.parse(params.get("selectedCourses") || "[]")
        };

        const semester = String(user.semester);

        // ----------------------------------------------------------
        // 2) DATENBANKEN LADEN
        // ----------------------------------------------------------
        const dhbwDefs = window.dhbwCourses || {};
        const partnerDefs = window.compatibleCourses || {};

        // ----------------------------------------------------------
        // 3) PARTNERUNIVERSITÄT LADEN
        // ----------------------------------------------------------
        let partnerKey = null;

        if (user.universityId && partnerDefs[user.universityId]) {
            partnerKey = user.universityId;
        } else {
            partnerKey = Object.keys(partnerDefs).find(
                k => partnerDefs[k].name.toLowerCase() === user.university.toLowerCase()
            ) || null;
        }

        if (!partnerKey) partnerKey = Object.keys(partnerDefs)[0];

        const partner = partnerDefs[partnerKey];
        const partnerCourses = partner.semesters?.[semester] || [];

        // ----------------------------------------------------------
        // 4) DHBW MODULE LADEN
        // ----------------------------------------------------------
        const dhbwModules =
            dhbwDefs[user.studiengang]?.semesters?.[semester] || [];

        // ----------------------------------------------------------
        // 5) PARTNER-MAPPING ERSTELLEN
        // ----------------------------------------------------------
        function buildMapping() {
            const mapping = [];

            // 1) DHBW Module in die Tabelle einfügen
            dhbwModules.forEach(m => {
                mapping.push({
                    dhbwModule: m.name,
                    dhbwECTS: m.ects,
                    partnerCourse: "",
                    partnerECTS: ""
                });
            });

            // Kurs-Map
            const partnerMap = {};
            partnerCourses.forEach(c => partnerMap[c.id] = c);

            const selected = user.selectedCourses.map(cid => partnerMap[cid]).filter(Boolean);

            // 2) Partnerkurse den bestehenden DHBW-Zeilen zuordnen
            selected.forEach((course, idx) => {
                if (idx < mapping.length) {
                    // in bestehende Zeile einfügen
                    mapping[idx].partnerCourse = course.name;
                    mapping[idx].partnerECTS = course.ects || "";
                } else {
                    // NEUE ZEILE anhängen
                    mapping.push({
                        dhbwModule: "",
                        dhbwECTS: "",
                        partnerCourse: course.name,
                        partnerECTS: course.ects || ""
                    });
                }
            });

            // Summen berechnen
            const totals = {
                dhbw: dhbwModules.reduce((a, b) => a + (b.ects || 0), 0),
                partner: selected.reduce((a, c) => a + (c?.ects || 0), 0)
            };

            return { mapping, totals };
        }

        const result = buildMapping();

        // ----------------------------------------------------------
        // 6) DOM ELEMENTE
        // ----------------------------------------------------------
        const preview = qs("#pdf-preview");

        // ----------------------------------------------------------
        // 7) HELFER
        // ----------------------------------------------------------
        function metaCell(de, en, value) {
            return `
                <div class="meta-item">
                    <div class="meta-label">
                        <span class="meta-label-de">${de}:</span>
                        <span class="meta-label-en">${en}:</span>
                    </div>
                    <div class="meta-value-placeholder">${value || "—"}</div>
                </div>
            `;
        }

        // ----------------------------------------------------------
        // 8) DOKUMENT RENDERN (MIT ORIGINAL-HINWEISEN & SIGNATUREN)
        // ----------------------------------------------------------
        function renderLA() {

            preview.innerHTML = "";

            // ------------ LOGO -----------------
            const logo = document.createElement("img");
            logo.src = "https://citationstyler.com/wp-content/uploads/2024/04/DHBW-logo-square.png.webp";
            logo.className = "la-logo-outside";
            preview.appendChild(logo);

            // ------------ HEADER --------------
            const header = document.createElement("div");
            header.className = "la-header";
            header.innerHTML = `
                <div class="la-h-content">
                    <h2>Learning Agreement für die Anerkennung von im Ausland erbrachten Studienleistungen</h2>
                    <div class="la-sub">Bestätigung & Anerkennung von Studienleistungen | Duale Hochschule Baden-Württemberg</div>
                </div>
            `;
            preview.appendChild(header);

            // ------------ METADATEN ------------
            const meta = document.createElement("div");
            meta.className = "la-meta-data";
            meta.innerHTML = `
                <div class="la-meta-row">
                    <div class="la-meta-col">
                        ${metaCell("Gasthochschule", "Receiving institution", partner.name)}
                        ${metaCell("Zeitraum", "Period", user.zeitraum)}
                        ${metaCell("ECTS der Gastkurse", "ECTS of partner courses", result.totals.partner)}
                        ${metaCell("Studiengangsleitung", "Departmental coordinator", user.studiengangsleitung)}
                    </div>
                    <div class="la-meta-col">
                        ${metaCell("Name Studierender", "Name of student", `${user.vorname} ${user.nachname}`)}
                        ${metaCell("Kurs", "Study group", user.kurs)}
                        ${metaCell("Studiengang", "Department", dhbwDefs[user.studiengang]?.name || user.studiengang)}
                        ${metaCell("Vertiefung", "Specialisation", user.vertiefung)}
                    </div>
                </div>
            `;
            preview.appendChild(meta);

            // ------------ MAPPING-TABELLE ----------
            const courses = document.createElement("div");
            courses.className = "la-courses";
            courses.innerHTML = `<h3>Modul-Zuordnung und Kurswahl</h3>`;

            const table = document.createElement("table");
            table.className = "mapping-table";

            table.innerHTML = `
                <thead>
                    <tr>
                        <th colspan="2">DHBW Module</th>
                        <th colspan="2">Partner Courses</th>
                    </tr>
                    <tr>
                        <th>Modul</th>
                        <th>ECTS</th>
                        <th>Kurs</th>
                        <th>ECTS</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tb = table.querySelector("tbody");

            result.mapping.forEach(m => {
                tb.innerHTML += `
                    <tr>
                        <td>${m.dhbwModule}</td>
                        <td>${m.dhbwECTS}</td>
                        <td>${m.partnerCourse}</td>
                        <td>${m.partnerECTS}</td>
                    </tr>
                `;
            });

            tb.innerHTML += `
                <tr class="total-credits">
                    <td></td>
                    <td><strong>${result.totals.dhbw}</strong></td>
                    <td></td>
                    <td><strong>${result.totals.partner}</strong></td>
                </tr>
            `;

            courses.appendChild(table);
            preview.appendChild(courses);

            // ---------------------------------------------------------
            //  ORIGINAL HINWEISE (EXAKT wie vorher)
            // ---------------------------------------------------------
            const notes = document.createElement("div");
            notes.className = "la-note-section";
            notes.innerHTML = `
                <strong>Wichtige Hinweise:</strong>
                <p>• Studienleistungen aus dem Ausland werden nach inhaltlicher Prüfung anerkannt.</p>
                <p>• Dieses Dokument dient als verbindliche Grundlage für die Anerkennung.</p>
            `;
            preview.appendChild(notes);

            // ---------------------------------------------------------
            // ORIGINAL SIGNATURFELDER (EXAKT wie vorher)
            // ---------------------------------------------------------
            // ---------------------------------------------------------
//  SIGNATURE SECTION – 1:1 WIE IM ALTEN PDF
// ---------------------------------------------------------
            const signatures = document.createElement("div");
            signatures.className = "la-signatures-oldpdf";

            signatures.innerHTML = `
    <h3>Unterschriften</h3>

    <table class="sig-old-table">
        <tbody>

            <!-- STUDENT -->
            <tr>
                <td class="sig-cell">
                    <div class="sig-line"></div>
                    <div class="sig-label">Unterschrift Studierende/r</div>
                </td>
                <td class="sig-cell">
                    <div class="sig-line"></div>
                    <div class="sig-label">Datum</div>
                </td>
            </tr>

            <!-- STUDIENGANGSLEITUNG -->
            <tr>
                <td class="sig-cell">
                    <div class="sig-line"></div>
                    <div class="sig-label">Unterschrift Studiengangsleitung</div>
                </td>
                <td class="sig-cell">
                    <div class="sig-line"></div>
                    <div class="sig-label">Datum</div>
                </td>
            </tr>

            <!-- AKADEMISCHE LEITUNG -->
            <tr>
                <td class="sig-cell">
                    <div class="sig-line"></div>
                    <div class="sig-label">Unterschrift Akademische Leitung</div>
                </td>
                <td class="sig-cell">
                    <div class="sig-line"></div>
                    <div class="sig-label">Datum</div>
                </td>
            </tr>

        </tbody>
    </table>
`;

            preview.appendChild(signatures);

        }

        renderLA();

        // ----------------------------------------------------------
        // 9) PDF DOWNLOAD
        // ----------------------------------------------------------
        const downloadBtn = qs("#download-pdf");

        downloadBtn?.addEventListener("click", () => {
            if (!window.html2pdf) {
                const s = document.createElement("script");
                s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js";
                s.onload = generatePDF;
                document.head.appendChild(s);
            } else generatePDF();
        });

        function generatePDF() {
            html2pdf()
                .set({
                    margin: [0, 0, 0, 0],   // exakt wie vorher
                    filename: `Learning-Agreement-${user.vorname}-${user.nachname}.pdf`,
                    html2canvas: { scale: 2, letterRendering: true },
                    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
                })
                .from(preview)
                .save();
        }

        // ----------------------------------------------------------
        // E-Mail Teilen
        // ----------------------------------------------------------
        qs("#share-pdf")?.addEventListener("click", () => {
            window.location.href = "mailto:?subject=Learning Agreement&body=Hier ist mein Learning Agreement.";
        });

        // ----------------------------------------------------------
        // Absenden (an Webhook.site)
        // ----------------------------------------------------------
        const submitButton = qs("#submit-la");
        const WEBHOOK_URL = "https://webhook-test.com/58d92fab97ec76b1b63b24a8effcbb99"; // <-- Hier bitte die aktuelle Webhook-URL eintragen!!!

        submitButton?.addEventListener("click", () => {

            // HOLE DAS STATUS-ELEMENT HIER, DIREKT BEIM KLICK
            let statusDiv = document.querySelector("#submission-status"); // Direkte DOM-Abfrage

            // Prüfe, ob das Element jetzt existiert
            if (!statusDiv) {
                // Element existiert nicht, erstelle es
                statusDiv = document.createElement("div");
                statusDiv.id = "submission-status";
                statusDiv.setAttribute("role", "status");

                // Wende das Styling direkt an, falls die <style>-Tags auch entfernt wurden
                statusDiv.style.marginTop = "1.5rem";
                statusDiv.style.fontSize = "1rem";
                statusDiv.style.fontWeight = "bold";
                statusDiv.style.textAlign = "center";

                // Finde die Button-Gruppe, um das Status-Element danach einzufügen
                const buttonGroup = document.querySelector(".step-navigation-buttons.step4-nav");

                if (buttonGroup) {
                    // .after() fügt das neue Element direkt nach der Button-Gruppe ein
                    buttonGroup.after(statusDiv);
                } else {
                    // Fallback, falls die Button-Gruppe nicht gefunden wird
                    console.error("Fehler: Button-Gruppe .step4-nav nicht gefunden. Status wird am Ende angehängt.");
                    qs(".preview-section")?.appendChild(statusDiv);
                }
            }

            // 1. Button deaktivieren und Status setzen
            submitButton.disabled = true;
            statusDiv.textContent = 'Antrag wird gesendet...';
            statusDiv.style.color = '#555';

            // 2. URL-Parameter holen
            const urlParams = new URLSearchParams(window.location.search);

            // 3. Senden mit fetch() - "Fire and Forget"
            // Wir senden die Anfrage, aber warten nicht auf eine Antwort
            // oder fangen Fehler ab.
            fetch(WEBHOOK_URL, {
                method: 'POST',
                body: urlParams // Sendet die URL-Parameter als form-data
            });

            // 4. Status sofort auf "Erledigt" setzen (angenommen, es klappt)
            statusDiv.textContent = 'Antrag übermittelt!';
            statusDiv.style.color = 'green';
            submitButton.textContent = 'Erledigt!';

            // Optional: "Zurück"-Button ausblenden
            const backButton = qs(".step-navigation-buttons a[href='./step3.html']");
            if (backButton) backButton.style.display = 'none';
        });



        //qs("#submit-la")?.addEventListener("click", () => {
        //    alert("Learning Agreement erfolgreich eingereicht!");
        //});

        // ----------------------------------------------------------
        // 10) ZURÜCK ZU STEP 3 (ALLE PARAMETER MITNEHMEN)
        // ----------------------------------------------------------
        qs("#back-to-step3")?.addEventListener("click", () => {
            const currentParams = new URLSearchParams(window.location.search);
            window.location.href = `./step3.html?${currentParams.toString()}`;
        });

    });

})();