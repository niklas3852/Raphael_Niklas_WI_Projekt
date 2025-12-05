(function () {
    // Dieses File bleibt als Fallback bestehen, delegiert aber vollständig an die
    // neue API-gestützte Kurslogik.
    async function loadCoursesViaApi() {
        if (window.dhbwApi?.fetchCourses) {
            return window.dhbwApi.fetchCourses();
        }

        console.error("dhbwApi.fetchCourses ist nicht verfügbar. Bitte stelle sicher, dass src/dhbw-api.js geladen wird.");
        return [];
    }

    window.getDhbwCourseList = loadCoursesViaApi;
})();
