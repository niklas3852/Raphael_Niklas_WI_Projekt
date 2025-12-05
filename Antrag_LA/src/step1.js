document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    //   ELEMENTE
    // =====================================================

    const form = document.getElementById("step1-form");
    const nextBtn = document.getElementById("next");

    const vorname = document.querySelector("[name='Vorname'], [name='vorname']");
    const nachname = document.querySelector("[name='Nachname'], [name='nachname']");
    const matrikel = document.querySelector("[name='Matrikel'], [name='matrikelnummer'], [name='Matrikelnummer']");
    const matrikelHint = document.getElementById("matrikelnummer-hint");
    const kurs = document.querySelector("[name='Kurs']");
    const studiengang = document.getElementById("studiengang-select");
    const semester = document.querySelector("[name='Semester']");
    const studiengangsleitung = document.querySelector("[name='Studiengangsleitung']");

    const vertiefungSelect = document.getElementById("vertiefung-select");
    const vertiefungField = document.getElementById("vertiefung-field");

    const dateRangeInput = document.getElementById("date-range-picker");

    const studiengaenge = Array.isArray(window.dhbwStudiengaenge) ? window.dhbwStudiengaenge : [];
    const studiengangMap = studiengaenge.reduce((acc, sg) => {
        acc[sg.id] = sg;
        return acc;
    }, {});

    function buildStepPayload() {
        return {
            vorname: vorname?.value.trim() || "",
            nachname: nachname?.value.trim() || "",
            matrikel: matrikel?.value.trim() || "",
            kurs: kurs?.value.trim() || "",
            studiengang: studiengang?.value || "",
            semester: semester?.value || "",
            vertiefung: vertiefungSelect?.value || "",
            studiengangsleitung: studiengangsleitung?.value.trim() || "",
            zeitraum: dateRangeInput?.value.trim() || ""
        };
    }

    function syncUrlWithForm(updates = {}) {
        const payload = { ...buildStepPayload(), ...updates };
        return window.urlState?.setParams ? window.urlState.setParams(payload) : new URLSearchParams(window.location.search);
    }

    // Stellt den Formularzustand anhand der URL-Parameter wieder her
    function restoreFromParams() {
        const params = window.urlState?.getParams ? window.urlState.getParams() : new URLSearchParams(window.location.search);

        const merged = {
            vorname: params.get("vorname") || "",
            nachname: params.get("nachname") || "",
            matrikel: params.get("matrikel") || "",
            kurs: params.get("kurs") || "",
            studiengang: params.get("studiengang") || "",
            semester: params.get("semester") || "",
            vertiefung: params.get("vertiefung") || "",
            studiengangsleitung: params.get("studiengangsleitung") || "",
            zeitraum: params.get("zeitraum") || ""
        };

        if (vorname) vorname.value = merged.vorname || "";
        if (nachname) nachname.value = merged.nachname || "";
        if (matrikel) matrikel.value = merged.matrikel || "";
        if (kurs) kurs.value = merged.kurs || "";
        if (studiengang && merged.studiengang) studiengang.value = merged.studiengang;
        if (semester && merged.semester) semester.value = merged.semester;
        if (vertiefungSelect && merged.vertiefung) vertiefungSelect.value = merged.vertiefung;
        if (studiengangsleitung) studiengangsleitung.value = merged.studiengangsleitung || "";
        if (dateRangeInput) dateRangeInput.value = merged.zeitraum || "";

        return merged;
    }

    function populateStudiengangOptions() {
        if (!studiengang) return;

        studiengaenge.forEach(sg => {
            const option = document.createElement("option");
            option.value = sg.id;
            option.textContent = sg.name;
            studiengang.appendChild(option);
        });
    }

    // =====================================================
    //   STUDIENGANG → VERTIEFUNG LOGIK
    // =====================================================

    // Baut die Vertiefungs-Auswahl dynamisch anhand des gewählten Studiengangs auf.
    function updateVertiefungOptions() {
        if (!vertiefungSelect) return;
        vertiefungSelect.innerHTML = `<option value="">Bitte wählen...</option>`;

        const sg = studiengang?.value;
        const current = sg ? studiengangMap[sg] : null;
        if (!current) {
            vertiefungSelect.disabled = true;
            return;
        }

        const vers = current.vertiefungen || [];
        vertiefungSelect.disabled = false;

        vers.forEach(v => {
            const o = document.createElement("option");
            o.value = v.id || v.value || v;
            o.textContent = v.name || v.label || v;
            vertiefungSelect.appendChild(o);
        });
    }

    populateStudiengangOptions();
    const initialData = restoreFromParams();

    if (studiengang) {
        studiengang.addEventListener("change", () => {
            updateVertiefungOptions();
            syncUrlWithForm();
        });
        updateVertiefungOptions();
    }

    if (initialData?.vertiefung && vertiefungSelect) {
        vertiefungSelect.value = initialData.vertiefung;
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
                        syncUrlWithForm();
                    }
                });
            }
        });
    }

    // Persistierende Eingaben & Nummern-Validation für Matrikelnummer
    [vorname, nachname, kurs, studiengangsleitung, dateRangeInput].forEach(el => {
        el?.addEventListener("input", () => syncUrlWithForm());
    });

    [semester, vertiefungSelect].forEach(el => {
        el?.addEventListener("change", () => syncUrlWithForm());
    });

    function validateMatrikelInput() {
        if (!matrikel) return true;

        // Entfernt Nicht-Ziffern robust, damit auch Copy-Paste bereinigt wird.
        const digitsOnly = matrikel.value.replace(/\D+/g, "");
        if (digitsOnly !== matrikel.value) {
            matrikel.value = digitsOnly;
        }

        const isValid = digitsOnly.length > 0;
        if (!isValid) {
            matrikel.setCustomValidity("Bitte gib eine gültige Matrikelnummer mit Ziffern ein.");
            if (matrikelHint) matrikelHint.textContent = "Die Matrikelnummer darf nur aus Zahlen bestehen.";
        } else {
            matrikel.setCustomValidity("");
            if (matrikelHint) matrikelHint.textContent = "";
        }

        return isValid;
    }

    if (matrikel) {
        matrikel.addEventListener("input", () => {
            validateMatrikelInput();
            syncUrlWithForm();
        });
        matrikel.addEventListener("blur", validateMatrikelInput);
    }


    // =====================================================
    //   WEITER → VALIDIEREN & URL-NAVIGATION
    // =====================================================

    if (nextBtn) {
        nextBtn.addEventListener("click", e => {
            e.preventDefault();

            syncUrlWithForm();

            const matrikelOk = validateMatrikelInput();
            if (!matrikelOk) {
                matrikel?.reportValidity();
                return;
            }

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const baseHref = nextBtn.getAttribute("href") || "./step2.html";
            const updatedParams = syncUrlWithForm();
            const finalUrl = `${baseHref}?${updatedParams.toString()}`;

            window.location.href = finalUrl;
        });
    }
});