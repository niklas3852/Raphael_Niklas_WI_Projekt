export const DHBW_STUDIENGAENGE = {
    wi: {
        name: "Wirtschaftsinformatik",
        vertiefungen: {
            ds: "Data Science",
            se: "Software Engineering",
            be: "Business Engineering"
        }
    }
    // ⚠️ In Zukunft werden weitere Studiengänge ergänzt
};

// Als Fallback die Daten auch global verfügbar machen, damit bestehende Skripte
// weiterhin funktionieren und ohne Build-Step genutzt werden können.
if (typeof window !== "undefined") {
    window.DHBW_STUDIENGAENGE = DHBW_STUDIENGAENGE;

    // Abwärtskompatibles Array-Format für ältere Aufrufer
    window.dhbwStudiengaenge = Object.entries(DHBW_STUDIENGAENGE).map(([id, data]) => ({
        id,
        code: (data.code || id).toUpperCase(),
        name: data.name,
        vertiefungen: Object.entries(data.vertiefungen || {}).map(([vid, vName]) => ({
            id: vid,
            code: vid.toUpperCase(),
            name: vName
        }))
    }));
}
