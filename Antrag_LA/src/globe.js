(function () {
    const container = document.getElementById('globe-container');
    if (!container) return console.error("❌ Kein #globe-container gefunden!");

    const myGlobe = Globe({ rendererConfig: { alpha: true, antialias: true } })(container)
        .globeImageUrl('../assets/pictures/globe/globe-surface_8k.jpg')
        .bumpImageUrl('../assets/pictures/globe/globe-surface_8k.jpg')
        .showAtmosphere(true)
        .atmosphereColor('lightskyblue')
        .atmosphereAltitude(0.25)
        .backgroundColor('rgba(0,0,0,0)')
        .width(container.offsetWidth)
        .height(container.offsetHeight)
        .showGraticules(false)
        .pointAltitude(0)            // ⬅️ Fix: Marker nicht mehr in der Luft
        .pointColor('color')
        .pointsData([])
        .htmlElementsData([])
        .htmlElement(d => {
            const el = document.createElement('div');
            el.textContent = d.title;

            // Text Styling
            el.style.color = 'white';
            el.style.fontSize = '0.75rem';
            el.style.fontWeight = 'bold';
            el.style.pointerEvents = 'none';
            el.style.whiteSpace = 'nowrap';
            el.style.transform = 'translate(-50%, -120%)';

            // Hintergrund Kasten mit Blur
            el.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; // halbtransparent schwarz
            el.style.backdropFilter = 'blur(5px)';          // Blur Effekt
            el.style.padding = '0.1rem 0.4rem';
            el.style.borderRadius = '20px';
            el.style.textAlign = 'center';
            el.style.textShadow = '0 0 5px black';

            return el;
        })
        .arcsData([]);

    const canvas = container.querySelector('canvas');
    if (canvas) {
        // Optik: Abrunden
        canvas.style.borderRadius = '15px';

        // Sicherstellen, dass das Canvas zentriert gerendert wird,
        // selbst wenn die Globe-Library es absolut positioniert.
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        canvas.style.width = 'auto';
        canvas.style.height = 'auto';
        canvas.style.position = 'relative';
        canvas.style.left = 'auto';
        canvas.style.top = 'auto';
        canvas.style.transform = 'none';
    }

    console.info("✅ Globe läuft");

    // 🌍 Rotation
    let rotationSpeed = 0.0015;
    let isRotating = true;
    const scene = myGlobe.scene();

    function rotateGlobe() {
        const globeMesh = scene.children.find(c => c.type === 'Mesh');
        if (isRotating && globeMesh) globeMesh.rotation.y += rotationSpeed;
        requestAnimationFrame(rotateGlobe);
    }
    rotateGlobe();

    // 🕹 Controls
    const controls = myGlobe.controls();
    if (controls) {
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = true;
    }

    // 📍 Heilbronn Marker
    const heilbronn = { lat: 49.1427, lng: 9.2108, size: 2.5, color: 'red', title: 'Hellbronn' };
    let selectedCity = null;

    function updatePoints() {
        const markers = [heilbronn];
        if (selectedCity) markers.push(selectedCity);
        myGlobe.pointsData(markers);
        myGlobe.htmlElementsData(markers);
    }

    // 👉 Initial Heilbronn Fokus
    myGlobe.pointOfView({ lat: heilbronn.lat, lng: heilbronn.lng, altitude: 2 }, 1200);
    updatePoints();

    // ✅ Marker setzen für zweite Stadt (Heilbronn bleibt immer bestehen)
    window.setGlobeMarker = function (lat, lng, opts = {}) {
        opts = Object.assign({ size: 2, color: 'orange', title: '', focusDurationMs: 1200, altitude: 2 }, opts);

        isRotating = false;

        selectedCity = { lat, lng, size: opts.size, color: opts.color, title: opts.title };
        updatePoints();

        myGlobe.pointOfView({ lat, lng, altitude: opts.altitude + 0.5 }, opts.focusDurationMs);
    };

    // 🧹 Auswahl löschen → nur Heilbronn bleibt
    window.clearGlobeMarker = function () {
        selectedCity = null;
        updatePoints();
        myGlobe.pointOfView({ lat: heilbronn.lat, lng: heilbronn.lng, altitude: 2 }, 1200);
        isRotating = true;
    };

    // 🟠 Mehrere Punkte (falls du das Feature behalten willst)
    window.setGlobePoints = function (pts) {
        selectedCity = null;
        const markers = [heilbronn, ...(Array.isArray(pts) ? pts : []).map(p => ({
            lat: p.lat,
            lng: p.lng,
            size: p.size || 1,
            color: p.color || 'orange',
            title: p.title || ''
        }))];
        myGlobe.pointsData(markers);
        myGlobe.htmlElementsData(markers);
    };

    // ✈️ Route zeichnen
    window.setGlobeRoute = function (destLat, destLng, opts = {}) {
        const arcOpts = Object.assign({ color: 'black', altitude: 0.05 }, opts);
        const route = {
            startLat: heilbronn.lat,
            startLng: heilbronn.lng,
            endLat: destLat,
            endLng: destLng,
            color: arcOpts.color,
            arcAltitude: arcOpts.altitude,
            arcStroke: 0.3
        };
        myGlobe.arcsData([route]);
    };

    // ▶ Rotation
    window.resumeGlobeRotation = function (speed) {
        if (typeof speed === 'number') rotationSpeed = speed;
        isRotating = true;
    };

    // ⏸ Rotation stoppen
    window.stopGlobeRotation = function () {
        isRotating = false;
    };

    // 📐 Responsiveness
    window.addEventListener('resize', () => {
        myGlobe.width(container.offsetWidth);
        myGlobe.height(container.offsetHeight);
    });
})();
