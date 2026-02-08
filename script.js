// -----------------------------
// Silentap - Haupt-Script
// -----------------------------

// Zähler
let counter = 0;

// Elemente
const dot = document.getElementById('dot');
const counterDisplay = document.getElementById('counter');
const supportButton = document.getElementById('supportButton'); // Dein Support-Button
const dotSize = 50; // Punktgröße in px (wie im CSS definiert)
const padding = 10; // Abstand zum Rand

// Funktion zum Teleportieren des Punktes
function teleportDot() {
    // Höhe für Support-Button berücksichtigen
    const buttonHeight = supportButton.offsetHeight + 20;

    // Begrenzung des Teleportbereichs
    const maxX = window.innerWidth - dotSize - padding;
    const maxY = window.innerHeight - dotSize - padding - buttonHeight;
    const minX = padding;
    const minY = padding;

    // Zufällige Position innerhalb der erlaubten Fläche
    const randomX = Math.floor(Math.random() * (maxX - minX) + minX);
    const randomY = Math.floor(Math.random() * (maxY - minY) + minY);

    dot.style.left = randomX + "px";
    dot.style.top = randomY + "px";
}

// Klick auf Punkt → Zähler erhöhen + Punkt teleportieren
dot.addEventListener('click', () => {
    counter++;
    counterDisplay.innerText = counter;
    teleportDot();
});

// Optional: Punkt initial positionieren beim Laden
window.addEventListener('load', () => {
    teleportDot();
    counterDisplay.innerText = counter;
});

// Optional: Punkt reagiert auf Fenstergröße ändern
window.addEventListener('resize', () => {
    teleportDot();
});
