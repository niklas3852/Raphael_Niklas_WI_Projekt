(function () {
    const API_URL = "https://wi-web.heilbronn.dhbw.de/api/index.php/module_units?key=BnCdI1fL5hU8sL9dDsJ2jN0mZ3eC0oW4uPaC6vJ9kLfG0rMnS3yWxEcU1wZdL5gLiO2tJhX7";

    const studiengaenge = Array.isArray(window.dhbwStudiengaenge) ? window.dhbwStudiengaenge : [];
    const programByCode = studiengaenge.reduce((map, sg) => {
        if (sg.code) map[sg.code.toUpperCase()] = sg;
        return map;
    }, {});

    function findVertiefung(program, code) {
        if (!program || !code) return null;
        const normalized = code.toUpperCase();
        return (program.vertiefungen || []).find(v => v.code?.toUpperCase() === normalized) || null;
    }

    function parseModule(moduleNr = "") {
        const match = moduleNr.match(/^W\d+([A-Z]{2})_([A-Z]{2})/);
        if (!match) return {};

        const [, programCode, vertiefungCode] = match;
        const program = programByCode[programCode];
        const vertiefung = findVertiefung(program, vertiefungCode);

        return {
            programId: program?.id || null,
            programName: program?.name || programCode,
            programCode,
            vertiefungId: vertiefung?.id || null,
            vertiefungName: vertiefung?.name || vertiefungCode,
            vertiefungCode
        };
    }

    async function fetchCoursesFromApi() {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Fehler beim Abruf der DHBW-Kurse (${response.status})`);

        const payload = await response.json();
        if (!Array.isArray(payload)) return [];

        return payload
            .map(entry => {
                const meta = parseModule(entry.ModuleNr);
                if (!meta.programId || !meta.vertiefungId) return null;

                return {
                    id: `${entry.ModuleNr || ""}:${entry.UnitNr || ""}`,
                    name: entry.UnitName || entry.ModuleName || entry.ModuleNr || "Unbenannte Lehrveranstaltung",
                    description: entry.ModuleName || entry.UnitName || "",
                    ects: Number(entry.Credits) || 0,
                    semester: String(entry.SemesterNr ?? "0"),
                    programId: meta.programId,
                    programName: meta.programName,
                    programCode: meta.programCode,
                    vertiefungId: meta.vertiefungId,
                    vertiefungName: meta.vertiefungName,
                    vertiefungCode: meta.vertiefungCode,
                    raw: entry
                };
            })
            .filter(Boolean);
    }

    async function loadCourses() {
        try {
            const courses = await fetchCoursesFromApi();
            window.dhbwCourses = courses;
            return courses;
        } catch (error) {
            console.error("DHBW-Kurse konnten nicht geladen werden:", error);
            window.dhbwCourses = [];
            return [];
        }
    }

    window.dhbwCoursesLoaded = loadCourses();
    window.getDhbwCourseList = async function () {
        if (window.dhbwCourses) return window.dhbwCourses;
        return window.dhbwCoursesLoaded || [];
    };
})();
