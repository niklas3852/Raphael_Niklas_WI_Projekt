export const COMPATIBLE_COURSES = {
    "7af32c914b8e45d0a19c2b7e5fd84103": {
        name: "University of Belgrade",
        courses: [
            {
                id: "bel-eco-101",
                name: "Introduction to Economics",
                description: "Grundprinzipien der Wirtschaft und Marktmechanismen.",
                ects: 6,
                semester: 1,
                compatible: [
                    { studiengang: "wi", vertiefung: "be" }
                ]
            },
            {
                id: "bel-prog-102",
                name: "Programming Basics",
                description: "Einführung in die Programmierung mit Python.",
                ects: 5,
                semester: 1,
                compatible: [
                    { studiengang: "wi", vertiefung: "se" },
                    { studiengang: "wi", vertiefung: "ds" }
                ]
            },
            {
                id: "bel-ml-201",
                name: "Data Structures and Algorithms",
                description: "Kernkonzepte zu Datenstrukturen und Algorithmen.",
                ects: 5,
                semester: 2,
                compatible: [
                    { studiengang: "wi", vertiefung: "se" },
                    { studiengang: "wi", vertiefung: "ds" }
                ]
            },
            {
                id: "bel-math-202",
                name: "Linear Algebra",
                description: "Vektorräume, Matrizen und lineare Gleichungssysteme.",
                ects: 5,
                semester: 2,
                compatible: [
                    { studiengang: "wi", vertiefung: "ds" }
                ]
            },
            {
                id: "bel-se-301",
                name: "Software Engineering",
                description: "Softwaredesign, Testen und Qualitätsmanagement.",
                ects: 5,
                semester: 3,
                compatible: [
                    { studiengang: "wi", vertiefung: "se" }
                ]
            },
            {
                id: "bel-stats-302",
                name: "Statistics",
                description: "Wahrscheinlichkeitsrechnung und statistische Verfahren.",
                ects: 5,
                semester: 3,
                compatible: [
                    { studiengang: "wi", vertiefung: "ds" }
                ]
            },
            {
                id: "bel-cloud-401",
                name: "Cloud Infrastructure",
                description: "IaaS, PaaS und grundlegende Cloud-Architekturen.",
                ects: 4,
                semester: 4,
                compatible: [
                    { studiengang: "wi", vertiefung: "se" },
                    { studiengang: "wi", vertiefung: "ds" }
                ]
            },
            {
                id: "bel-proc-402",
                name: "Process Management",
                description: "Geschäftsprozesse modellieren und optimieren.",
                ects: 5,
                semester: 4,
                compatible: [
                    { studiengang: "wi", vertiefung: "be" }
                ]
            },
            {
                id: "bel-ml-501",
                name: "Advanced Machine Learning",
                description: "Überwachtes und unüberwachtes Lernen mit Fallstudien.",
                ects: 5,
                semester: 5,
                compatible: [
                    { studiengang: "wi", vertiefung: "ds" }
                ]
            },
            {
                id: "bel-arch-502",
                name: "Software Architecture",
                description: "Architekturstile, Modularisierung und Wartbarkeit.",
                ects: 5,
                semester: 5,
                compatible: [
                    { studiengang: "wi", vertiefung: "se" }
                ]
            },
            {
                id: "bel-research-601",
                name: "Research Seminar",
                description: "Methoden und Vorbereitung auf die Abschlussarbeit.",
                ects: 3,
                semester: 6,
                compatible: [
                    { studiengang: "wi", vertiefung: "ds" },
                    { studiengang: "wi", vertiefung: "be" },
                    { studiengang: "wi", vertiefung: "se" }
                ]
            },
            {
                id: "bel-project-602",
                name: "Capstone Project",
                description: "Praxisnahes Projekt mit Industriepartnern.",
                ects: 6,
                semester: 6,
                compatible: [
                    { studiengang: "wi", vertiefung: "ds" },
                    { studiengang: "wi", vertiefung: "be" },
                    { studiengang: "wi", vertiefung: "se" }
                ]
            }
        ]
    }
};

if (typeof window !== "undefined") {
    window.compatibleCourses = COMPATIBLE_COURSES;
}
