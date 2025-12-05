function ensureLoaderMarkup(message, subline) {
    const existing = document.querySelector('.page-loader');
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.className = 'page-loader';
    overlay.innerHTML = `
        <div class="loader-card">
            <div class="loader-spinner">
                <span class="spinner-dot"></span>
                <span class="spinner-dot"></span>
                <span class="spinner-dot"></span>
            </div>
            <div class="loader-text">${message}</div>
            <p class="loader-subtext">${subline}</p>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('loading-active');
    return overlay;
}

function waitForDocumentReady() {
    if (document.readyState === 'complete') return Promise.resolve();
    return new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
}

export function waitForImages(scope = document) {
    const images = Array.from(scope.images || []);
    if (!images.length) return Promise.resolve();

    const loaders = images.map(img => {
        if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
        return new Promise(resolve => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
        });
    });

    return Promise.all(loaders);
}

export function initPageLoader({
    message = 'Wir bereiten deine Seite vor...',
    subline = 'Alle Inhalte werden im Hintergrund geladen.',
    minimumDuration = 600
} = {}) {
    const overlay = ensureLoaderMarkup(message, subline);
    const startedAt = performance.now();

    async function finish(extraPromises = []) {
        const tasks = [waitForDocumentReady(), waitForImages(document), ...extraPromises.filter(Boolean)];
        await Promise.all(tasks);

        const remaining = Math.max(0, minimumDuration - (performance.now() - startedAt));
        if (remaining) await new Promise(resolve => setTimeout(resolve, remaining));

        overlay.classList.add('page-loader--fade');
        document.body.classList.remove('loading-active');
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }

    return { finish };
}
