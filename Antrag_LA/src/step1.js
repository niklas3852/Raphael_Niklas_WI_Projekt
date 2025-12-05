document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    //   ELEMENTE
    // =====================================================

    const form = document.getElementById("step1-form");
    const nextBtn = document.getElementById("next");

    const vorname = document.querySelector("[name='Vorname'], [name='vorname']");
    const nachname = document.querySelector("[name='Nachname'], [name='nachname']");
    const matrikel = document.querySelector("[name='Matrikel'], [name='matrikelnummer'], [name='Matrikelnummer']");
    const kurs = document.querySelector("[name='Kurs']");
    const studiengang = document.getElementById("studiengang-select");
    const semester = document.querySelector("[name='Semester']");
    const studiengangsleitung = document.querySelector("[name='Studiengangsleitung']");

    const vertiefungSelect = document.getElementById("vertiefung-select");
    const vertiefungField = document.getElementById("vertiefung-field");

    const dateRangeInput = document.getElementById("date-range-picker");


    // =====================================================
    //   WICHTIG: ALLE AUTO-FILL / Speicherung entfernen!
    //   (In Option B wird NICHTS lokal gespeichert)
    // =====================================================



    // =====================================================
    //   STUDIENGANG → VERTIEFUNG LOGIK
    // =====================================================

    function updateVertiefungOptions() {
        vertiefungSelect.innerHTML = `<option value="">Bitte wählen...</option>`;

        const sg = studiengang.value;
        if (!sg || !window.dhbwCourses || !window.dhbwCourses[sg]) {
            vertiefungSelect.disabled = true;
            return;
        }

        const vers = window.dhbwCourses[sg].semesters.vertiefungen || [];
        vertiefungSelect.disabled = false;

        vers.forEach(v => {
            const o = document.createElement("option");
            o.value = v.value || v;
            o.textContent = v.label || v;
            vertiefungSelect.appendChild(o);
        });
    }

    if (studiengang) {
        studiengang.addEventListener("change", updateVertiefungOptions);
        updateVertiefungOptions();
    }


    // =====================================================
    //   DATUMS-PICKER
    // =====================================================

    if (dateRangeInput && window.Litepicker) {
        new Litepicker({
            element: dateRangeInput,
            singleMode: false,
            format: "DD.MM.YYYY",
            lang: "de-DE",
            setup: picker => {
                picker.on("selected", (d1, d2) => {
                    if (d1 && d2) {
                        dateRangeInput.value = `${d1.format("DD.MM.YYYY")} - ${d2.format("DD.MM.YYYY")}`;
                    }
                });
            }
        });
    }


    // =====================================================
    //   URL PARAMETER ERSTELLEN (Option B)
    // =====================================================

    function buildUrlParams() {
        const params = new URLSearchParams();

        params.set("vorname", vorname?.value.trim() || "");
        params.set("nachname", nachname?.value.trim() || "");
        params.set("matrikel", matrikel?.value.trim() || "");
        params.set("kurs", kurs?.value.trim() || "");
        params.set("studiengang", studiengang?.value || "");
        params.set("semester", semester?.value || "");
        params.set("vertiefung", vertiefungSelect?.value || "");
        params.set("studiengangsleitung", studiengangsleitung?.value.trim() || "");
        params.set("zeitraum", dateRangeInput?.value.trim() || "");

        return params.toString();
    }


    // =====================================================
    //   WEITER → VALIDIEREN & URL-NAVIGATION
    // =====================================================

    if (nextBtn) {
        nextBtn.addEventListener("click", e => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const baseHref = nextBtn.getAttribute("href") || "./step2.html";
            const finalUrl = `${baseHref}?${buildUrlParams()}`;

            window.location.href = finalUrl;
        });
    }
});