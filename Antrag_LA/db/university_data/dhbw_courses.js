(function () {
    const API_URL = "https://wi-web.heilbronn.dhbw.de/api/index.php/module_units?key=BnCdI1fL5hU8sL9dDsJ2jN0mZ3eC0oW4uPaC6vJ9kLfG0rMnS3yWxEcU1wZdL5gLiO2tJhX7";

    function getStudiengaenge() {
        return window.dhbwStudiengaenge || {};
    }

    function getSelectedSemester() {
        try {
            const state = JSON.parse(window.name || "{}") || {};
            const semester = Number(state?.step1Data?.semester);
            return Number.isFinite(semester) ? semester : null;
        } catch (e) {
            console.warn("Semester aus Zustand konnte nicht gelesen werden:", e);
            return null;
        }
    }

    function normalizeKeys(str) {
        return (str || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
    }

    function extractMetaFromModuleNr(moduleNr, fallbackSemester) {
        const match = (moduleNr || "").match(/^W?(\d+)?([A-Za-z]{2,})(?:_([A-Za-z]{1,}))/i);
        const semesterFromNr = match?.[1] ? parseInt(match[1], 10) : null;
        const semester = fallbackSemester && fallbackSemester > 0 ? fallbackSemester : semesterFromNr;
        const studiengangKey = match?.[2] ? normalizeKeys(match[2]) : null;
        const vertiefungKey = match?.[3] ? normalizeKeys(match[3]) : null;

        return { semester, studiengangKey, vertiefungKey };
    }

    function ensureProgramContainer(store, programKey) {
        const studiengangDef = getStudiengaenge()[programKey];
        if (!studiengangDef) return null;

        if (!store[programKey]) {
            store[programKey] = {
                code: studiengangDef.code || programKey,
                name: studiengangDef.name || programKey,
                vertiefungen: {},
                semesters: {}
            };
        }

        return store[programKey];
    }

    function ensureVertiefungContainer(program, programKey, vertiefungKey) {
        const studiengangDef = getStudiengaenge()[programKey];
        const vertiefungDef = studiengangDef?.vertiefungen?.[vertiefungKey];
        if (!vertiefungDef) return null;

        if (!program.vertiefungen[vertiefungKey]) {
            program.vertiefungen[vertiefungKey] = {
                code: vertiefungDef.code || vertiefungKey,
                name: vertiefungDef.name || vertiefungKey,
                semesters: {}
            };
        }

        return program.vertiefungen[vertiefungKey];
    }

    function pushCourse(container, semester, course) {
        if (!semester) return;
        const semKey = String(semester);
        if (!container[semKey]) container[semKey] = [];

        const alreadyExists = container[semKey].some(c => c.id === course.id);
        if (!alreadyExists) {
            container[semKey].push(course);
        }
    }

    async function fetchCourses() {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Fehler beim Laden der DHBW Module (${response.status})`);
        }

        const payload = await response.json();
        const store = {};
        const selectedSemester = getSelectedSemester();

        payload.forEach(unit => {
            const { semester, studiengangKey, vertiefungKey } = extractMetaFromModuleNr(unit.ModuleNr, unit.SemesterNr);
            if (!studiengangKey) return;

            const normalizedSemester = semester ? Number(semester) : null;
            if (selectedSemester && normalizedSemester && normalizedSemester !== selectedSemester) {
                return;
            }

            const program = ensureProgramContainer(store, studiengangKey);
            if (!program) return;

            const course = {
                id: unit.UnitNr || unit.ModuleNr,
                moduleNumber: unit.ModuleNr,
                moduleName: unit.ModuleName,
                name: unit.UnitName || unit.ModuleName,
                description: unit.ModuleName || unit.UnitName,
                ects: Number(unit.Credits) || 0
            };

            pushCourse(program.semesters, semester, course);

            const vertiefungContainer = vertiefungKey ? ensureVertiefungContainer(program, studiengangKey, vertiefungKey) : null;
            if (vertiefungContainer) {
                pushCourse(vertiefungContainer.semesters, semester, course);
            }
        });

        return store;
    }

    window.dhbwCoursesPromise = fetchCourses()
        .then(courses => {
            window.dhbwCourses = courses;
            document.dispatchEvent(new Event("dhbwCoursesLoaded"));
            return courses;
        })
        .catch(error => {
            console.error("DHBW Kurse konnten nicht geladen werden:", error);

            const fallback = {};
            const studiengaenge = getStudiengaenge();
            Object.entries(studiengaenge).forEach(([key, def]) => {
                fallback[key] = {
                    code: def.code || key,
                    name: def.name || key,
                    vertiefungen: def.vertiefungen || {},
                    semesters: {}
                };
            });

            window.dhbwCourses = fallback;
            document.dispatchEvent(new Event("dhbwCoursesLoaded"));
            return window.dhbwCourses;
        });
})();
