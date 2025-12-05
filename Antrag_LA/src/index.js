const steps = [
    {path: "", label: "Persönliche Daten"},
    {path: "hochschule", label: "Gasthochschule"},
    {path: "module", label: "Module"},
    {path: "ueberpruefung", label: "Überprüfung"}
];

function renderPage() {
    const stepIndex = parseInt(document.body.dataset.step) - 1;
    const content = document.getElementById("content-area");

    switch (stepIndex) {
        case 0:
            content.innerHTML = `<div class="formular-box-container">Formular für persönliche Daten...</div>`;
            break;
        case 1:
            content.innerHTML = `<div class="map-box-container">Karte / Gasthochschule...</div>`;
            break;
        case 2:
            content.innerHTML = `<div class="module-box-container">Module auswählen...</div>`;
            break;
        case 3:
            content.innerHTML = `<div class="review-box-container">Überprüfung der Eingaben...</div>`;
            break;
    }

    // Timeline dynamisch rendern
    const timelineContainer = document.querySelector(".timeline-bar-horizontal");
    timelineContainer.innerHTML = ""; // reset

    steps.forEach((step, i) => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        if(i < stepIndex) item.classList.add("completed");
        else if(i === stepIndex) item.classList.add("active");
        else item.classList.add("deactivated");

        item.innerHTML = `
            <span class="timeline-dot">${i + 1}</span>
            <div class="timeline-label">${step.label}</div>
        `;
        timelineContainer.appendChild(item);

        if(i < steps.length - 1) {
            const line = document.createElement("div");
            line.className = "timeline-line";
            timelineContainer.appendChild(line);
        }
    });

    // Buttons
    const backBtn = document.getElementById("back");
    const nextBtn = document.getElementById("next");

    backBtn.style.display = stepIndex === 0 ? "none" : "inline-block";
    nextBtn.textContent = stepIndex === steps.length - 1 ? "Abschließen" : "Weiter";
}

document.getElementById("next").addEventListener("click", () => {
    const stepIndex = parseInt(document.body.dataset.step);
    if(stepIndex < steps.length) {
        document.body.dataset.step = stepIndex + 1;
        renderPage();
    } else {
        alert("Formular wird abgeschickt!");
    }
});

document.getElementById("back").addEventListener("click", () => {
    const stepIndex = parseInt(document.body.dataset.step);
    if(stepIndex > 1) {
        document.body.dataset.step = stepIndex - 1;
        renderPage();
    }
});

window.addEventListener("DOMContentLoaded", renderPage);
