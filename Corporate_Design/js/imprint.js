/**
 * imprint.js
 * Steuert interaktive Elemente auf der Impressumsseite, insbesondere das Barrierefreiheits-Popup.
 */
// Öffnen/Schließen-Logik für das Barrierefreiheits-Pop-up

document.addEventListener("DOMContentLoaded", () => {
  const openLink = document.getElementById("barrierefreiheit-link");
  const popup = document.getElementById("barrierefreiheit-popup");
  const closeBtn = document.getElementById("close-popup");

  if (!openLink || !popup || !closeBtn) return;

  const openPopup = (evt) => {
    if (evt) evt.preventDefault();
    popup.showModal();
  };

  const closePopup = () => {
    popup.close();
  };

  // Klick auf Link öffnet das Pop-up
  openLink.addEventListener("click", openPopup);

  // Klick auf Schließen-Button
  closeBtn.addEventListener("click", closePopup);

  // Klick außerhalb der Content-Box schließt das Pop-up
  popup.addEventListener("click", (e) => {
    const rect = popup.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      popup.close();
    }
  });
});
