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

    const studiengaenge = Array.isArray(window.dhbwStudiengaenge) ? window.dhbwStudiengaenge : [];
    const studiengangMap = studiengaenge.reduce((acc, sg) => {
        acc[sg.id] = sg;
        return acc;
    }, {});

    const STEP_KEY = 'step1';


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

    function persistStepData() {
        if (!window.storageManager) return;
        window.storageManager.setStep(STEP_KEY, buildStepPayload());
    }

    function restoreFromStateOrParams() {
        const saved = window.storageManager?.getStep(STEP_KEY) || {};
        const params = new URLSearchParams(window.location.search);

        const merged = {
            ...saved,
            vorname: params.get("vorname") || saved.vorname || "",
            nachname: params.get("nachname") || saved.nachname || "",
            matrikel: params.get("matrikel") || saved.matrikel || "",
            kurs: params.get("kurs") || saved.kurs || "",
            studiengang: params.get("studiengang") || saved.studiengang || "",
            semester: params.get("semester") || saved.semester || "",
            vertiefung: params.get("vertiefung") || saved.vertiefung || "",
            studiengangsleitung: params.get("studiengangsleitung") || saved.studiengangsleitung || "",
            zeitraum: params.get("zeitraum") || saved.zeitraum || ""
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
    const initialData = restoreFromStateOrParams();

    if (studiengang) {
        studiengang.addEventListener("change", () => {
            updateVertiefungOptions();
            persistStepData();
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
                        persistStepData();
                    }
                });
            }
        });
    }

    // Persistierende Eingaben & Nummern-Validation für Matrikelnummer
    [vorname, nachname, kurs, studiengangsleitung, dateRangeInput].forEach(el => {
        el?.addEventListener("input", persistStepData);
    });

    [semester, vertiefungSelect].forEach(el => {
        el?.addEventListener("change", persistStepData);
    });

    if (matrikel) {
        matrikel.addEventListener("input", () => {
            const digits = matrikel.value.replace(/\D+/g, "");
            if (digits !== matrikel.value) matrikel.value = digits;
            persistStepData();
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

            persistStepData();

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