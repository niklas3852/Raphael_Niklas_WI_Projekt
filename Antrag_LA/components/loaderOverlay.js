let loaderOverlayEl = null;

function ensureStylesInjected() {
  if (document.querySelector('link[data-loader-overlay]')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./loaderOverlay.css', import.meta.url).toString();
  link.dataset.loaderOverlay = 'true';
  document.head.prepend(link);
}

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'loader-overlay';
  overlay.innerHTML = `
    <div class="loader-overlay__spinner" aria-hidden="true"></div>
    <div class="loader-overlay__text" role="status">Bitte warten… Inhalte werden geladen</div>
  `;
  return overlay;
}

export function showLoader() {
  ensureStylesInjected();
  if (loaderOverlayEl) return;

  const appendOverlay = () => {
    loaderOverlayEl = buildOverlay();
    document.body.prepend(loaderOverlayEl);
    requestAnimationFrame(() => loaderOverlayEl?.classList.add('is-visible'));
  };

  if (document.body) appendOverlay();
  else document.addEventListener('DOMContentLoaded', appendOverlay, { once: true });
}

export function hideLoader() {
  if (!loaderOverlayEl) return;

  const overlay = loaderOverlayEl;
  loaderOverlayEl = null;
  overlay.classList.remove('is-visible');
  setTimeout(() => overlay.remove(), 200);
}
