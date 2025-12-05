(function () {
    const API_URL = "https://wi-web.heilbronn.dhbw.de/api/index.php/module_units?key=BnCdI1fL5hU8sL9dDsJ2jN0mZ3eC0oW4uPaC6vJ9kLfG0rMnS3yWxEcU1wZdL5gLiO2tJhX7";
    const REQUEST_TIMEOUT = 10000;

    function normalizePrograms() {
        const config = window.DHBW_STUDIENGAENGE || {};
        return Object.entries(config).reduce((acc, [id, data]) => {
            const code = (data.code || id).toLowerCase();
            acc[code] = {
                id,
                code,
                name: data.name,
                vertiefungen: Object.entries(data.vertiefungen || {}).reduce((vAcc, [vid, vName]) => {
                    const vCode = vid.toLowerCase();
                    vAcc[vCode] = { id: vid, code: vCode, name: vName };
                    return vAcc;
                }, {})
            };
            return acc;
        }, {});
    }

    function parseModuleInfo(moduleNr = "") {
        const programMap = normalizePrograms();
        const match = moduleNr.match(/^W\d*([A-Z]{2})_([A-Z]{2})/i);
        if (!match) return {};

        const programCode = (match[1] || "").toLowerCase();
        const vertiefungCode = (match[2] || "").toLowerCase();

        const program = programMap[programCode];
        const vertiefung = program?.vertiefungen?.[vertiefungCode];

        return {
            studiengang: program?.id || programCode,
            studiengangCode: programCode.toUpperCase(),
            studiengangName: program?.name || programCode.toUpperCase(),
            vertiefung: vertiefung?.id || vertiefungCode,
            vertiefungCode: vertiefungCode.toUpperCase(),
            vertiefungName: vertiefung?.name || vertiefungCode.toUpperCase()
        };
    }

    function withTimeout(promise, timeoutMs) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        return Promise.race([
            promise(controller.signal).finally(() => clearTimeout(timer)),
        ]);
    }

    async function requestCourses(signal) {
        const response = await fetch(API_URL, { signal });
        if (!response.ok) {
            throw new Error(`Fehler beim Abruf der DHBW-Kurse (${response.status})`);
        }
        const payload = await response.json();
        return Array.isArray(payload) ? payload : [];
    }

    async function fetchCoursesFromApi() {
        try {
            const raw = await withTimeout(requestCourses, REQUEST_TIMEOUT);
            const normalized = raw
                .map(entry => {
                    const meta = parseModuleInfo(entry.ModuleNr || "");
                    if (!meta.studiengang || !meta.vertiefung) return null;

                    return {
                        id: `${entry.ModuleNr || ""}:${entry.UnitNr || ""}`,
                        moduleNr: entry.ModuleNr || "",
                        unitNr: entry.UnitNr || "",
                        moduleName: entry.ModuleName || "",
                        unitName: entry.UnitName || "",
                        name: entry.UnitName || entry.ModuleName || entry.ModuleNr || "Unbenannte Lehrveranstaltung",
                        description: entry.ModuleName || entry.UnitName || "",
                        ects: Number(entry.Credits) || 0,
                        semester: String(entry.SemesterNr ?? "0"),
                        studiengang: meta.studiengang,
                        studiengangName: meta.studiengangName,
                        vertiefung: meta.vertiefung,
                        vertiefungName: meta.vertiefungName
                    };
                })
                .filter(Boolean);

            window.dhbwCourseCache = normalized;
            return normalized;
        } catch (error) {
            console.error("DHBW-Kurse konnten nicht geladen werden:", error);
            window.dhbwCourseCache = [];
            return [];
        }
    }

    let coursePromise = null;
    async function getCourseList() {
        if (Array.isArray(window.dhbwCourseCache) && window.dhbwCourseCache.length) {
            return window.dhbwCourseCache;
        }
        if (!coursePromise) coursePromise = fetchCoursesFromApi();
        return coursePromise;
    }

        window.dhbwApi = {
            fetchCourses: getCourseList,
            getProgramById: (id) => normalizePrograms()[id?.toLowerCase?.()] || null,
            getVertiefungName: (progId, vertId) => normalizePrograms()[progId?.toLowerCase?.()]?.vertiefungen?.[vertId?.toLowerCase?.()]?.name || vertId,
        };
})();
