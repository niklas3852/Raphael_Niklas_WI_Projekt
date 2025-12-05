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
    minimumDuration = 600,
    maxWait = 10000
} = {}) {
    const overlay = ensureLoaderMarkup(message, subline);
    const startedAt = performance.now();
    let finished = false;

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function cleanup() {
        if (finished) return;
        finished = true;

        const remaining = Math.max(0, minimumDuration - (performance.now() - startedAt));
        if (remaining) await delay(remaining);

        overlay?.classList.add('page-loader--fade');
        document.body.classList.remove('loading-active');

        const removeOverlay = () => overlay?.remove();
        overlay?.addEventListener('transitionend', removeOverlay, { once: true });
        // Fallback, falls keine Transition ausgelöst wird
        setTimeout(removeOverlay, 600);
    }

    async function finish(extraPromises = []) {
        const tasks = [
            waitForDocumentReady(),
            waitForImages(document),
            ...extraPromises.filter(Boolean)
        ].map(promise => Promise.resolve(promise).catch(err => {
            console.error('Fehler während des Ladens erkannt. Führe trotzdem fort.', err);
            return null;
        }));

        const guardedTasks = Promise.allSettled(tasks);
        await Promise.race([
            guardedTasks,
            delay(maxWait)
        ]);

        await cleanup();
    }

    // Sicherstellen, dass der Loader spätestens nach dem Timeout verschwindet
    setTimeout(cleanup, Math.max(minimumDuration + 2000, maxWait + 2000));

    return { finish };
}
