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

    const storage = window.storageManager;
    const STEP_ID = 'step1';
    const lastMatrikel = storage?.getLastMatrikel ? storage.getLastMatrikel() : 'guest';

    const savedStepData = storage?.getStepData ? storage.getStepData(lastMatrikel, STEP_ID) : null;
    const urlParams = new URLSearchParams(window.location.search);
    const paramData = {
        vorname: urlParams.get('vorname') || '',
        nachname: urlParams.get('nachname') || '',
        matrikel: urlParams.get('matrikel') || '',
        kurs: urlParams.get('kurs') || '',
        studiengang: urlParams.get('studiengang') || '',
        semester: urlParams.get('semester') || '',
        vertiefung: urlParams.get('vertiefung') || '',
        studiengangsleitung: urlParams.get('studiengangsleitung') || '',
        zeitraum: urlParams.get('zeitraum') || ''
    };
    const initialData = savedStepData || paramData;

    function collectFormData() {
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

    function persistFormData() {
        if (!storage) return;
        const payload = collectFormData();
        const activeMatrikel = payload.matrikel || lastMatrikel;
        storage.setStepData(activeMatrikel, STEP_ID, payload);
        storage.setLastMatrikel(activeMatrikel);
    }

    function hydrateFormFromData(data) {
        if (!data) return;
        if (vorname && data.vorname) vorname.value = data.vorname;
        if (nachname && data.nachname) nachname.value = data.nachname;
        if (matrikel && data.matrikel) matrikel.value = data.matrikel;
        if (kurs && data.kurs) kurs.value = data.kurs;
        if (semester && data.semester) semester.value = data.semester;
        if (studiengangsleitung && data.studiengangsleitung) studiengangsleitung.value = data.studiengangsleitung;
        if (dateRangeInput && data.zeitraum) dateRangeInput.value = data.zeitraum;
    }


    // =====================================================
    //   WICHTIG: ALLE AUTO-FILL / Speicherung entfernen!
    //   (In Option B wird NICHTS lokal gespeichert)
    // =====================================================



    // =====================================================
    //   STUDIENGANG → VERTIEFUNG LOGIK
    // =====================================================

    async function getDhbwDefinitions() {
        if (window.dhbwCourses) return window.dhbwCourses;
        if (window.dhbwCoursesPromise) {
            window.dhbwCourses = await window.dhbwCoursesPromise;
            return window.dhbwCourses;
        }
        return {};
    }

    async function populateStudiengangOptions() {
        if (!studiengang) return;

        const defs = await getDhbwDefinitions();
        studiengang.innerHTML = `<option value="" disabled selected>Studiengang*</option>`;

        Object.entries(defs).forEach(([key, def]) => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = def.name || key;
            studiengang.appendChild(option);
        });
    }

    async function updateVertiefungOptions() {
        vertiefungSelect.innerHTML = `<option value="">Bitte wählen...</option>`;

        const sg = studiengang.value;
        const defs = await getDhbwDefinitions();
        const sgDef = defs[sg];
        const vertiefungen = sgDef?.vertiefungen || {};

        const entries = Object.values(vertiefungen);
        vertiefungSelect.disabled = entries.length === 0;
        if (vertiefungSelect.disabled) return;

        entries.forEach(v => {
            const o = document.createElement("option");
            o.value = v.code;
            o.textContent = v.name;
            vertiefungSelect.appendChild(o);
        });
    }

    if (studiengang) {
        studiengang.addEventListener("change", updateVertiefungOptions);
        populateStudiengangOptions().then(() => {
            if (initialData.studiengang) studiengang.value = initialData.studiengang;
            updateVertiefungOptions().then(() => {
                if (initialData.vertiefung) vertiefungSelect.value = initialData.vertiefung;
            });
        });
    }


    hydrateFormFromData(initialData);

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
                        persistFormData();
                    }
                });
            }
        });
    }

    [vorname, nachname, matrikel, kurs, studiengangsleitung, dateRangeInput].forEach(el => {
        el?.addEventListener("input", persistFormData);
    });
    [studiengang, semester, vertiefungSelect].forEach(el => {
        el?.addEventListener("change", persistFormData);
    });


    // =====================================================
    //   URL PARAMETER ERSTELLEN (Option B)
    // =====================================================

    function buildUrlParams() {
        const params = new URLSearchParams();
        const data = collectFormData();

        Object.entries({
            vorname: data.vorname,
            nachname: data.nachname,
            matrikel: data.matrikel,
            kurs: data.kurs,
            studiengang: data.studiengang,
            semester: data.semester,
            vertiefung: data.vertiefung,
            studiengangsleitung: data.studiengangsleitung,
            zeitraum: data.zeitraum
        }).forEach(([key, value]) => params.set(key, value || ""));

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

            persistFormData();

            const baseHref = nextBtn.getAttribute("href") || "./step2.html";
            const finalUrl = `${baseHref}?${buildUrlParams()}`;

            window.location.href = finalUrl;
        });
    }
});