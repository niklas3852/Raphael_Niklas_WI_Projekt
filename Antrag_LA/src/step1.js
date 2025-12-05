import { createUrlWithState, loadState, updateState } from "./shared-state.js";

document.addEventListener("DOMContentLoaded", () => {

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
    const dateRangeInput = document.getElementById("date-range-picker");

    const matrikelError = document.getElementById("matrikel-error");

    const storedState = loadState();
    const initialData = storedState.step1Data || {};

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

    function setupMatrikelInput() {
        if (!matrikel) return;

        matrikel.setAttribute("inputmode", "numeric");
        matrikel.setAttribute("pattern", "[0-9]*");
        matrikel.setAttribute("type", "number");

        const sanitize = () => {
            const digitsOnly = matrikel.value.replace(/\D+/g, "");
            if (digitsOnly !== matrikel.value) {
                matrikel.value = digitsOnly;
            }
        };

        const validateMatrikel = () => {
            const value = matrikel.value.trim();
            const digitsOnly = /^\d+$/.test(value);

            if (!value) {
                matrikel.setCustomValidity('Bitte Matrikelnummer eingeben.');
                if (matrikelError) matrikelError.textContent = '';
            } else if (!digitsOnly) {
                matrikel.setCustomValidity('Bitte nur Ziffern verwenden.');
                if (matrikelError) matrikelError.textContent = 'Matrikelnummern dürfen ausschließlich aus Zahlen bestehen.';
            } else {
                matrikel.setCustomValidity('');
                if (matrikelError) matrikelError.textContent = '';
            }
        };

        matrikel.addEventListener("beforeinput", event => {
            if (event.data && /\D/.test(event.data)) {
                event.preventDefault();
            }
        });

        matrikel.addEventListener("input", () => {
            sanitize();
            validateMatrikel();
        });

        matrikel.addEventListener("blur", validateMatrikel);

        sanitize();
        validateMatrikel();
    }

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

    setupMatrikelInput();

    if (nextBtn) {
        nextBtn.addEventListener("click", e => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const data = collectFormData();
            const nextState = updateState(prev => ({
                ...prev,
                step1Data: data
            }));

            window.laAllowUnload = true;
            window.location.href = createUrlWithState("./step2.html", nextState);
        });
    }
});
