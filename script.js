// ----------------------------
// Silentap - Script
// ----------------------------

// Zähler
let counter = 0;

// Elemente
const dot = document.getElementById('dot');
const counterDisplay = document.getElementById('counter');
const supportButton = document.getElementById('supportButton');
const dotSize = 50;  // Größe des Punktes
const padding = 10;  // Abstand zu Rändern

// Teleport-Funktion
function teleportDot() {
    const buttonHeight = supportButton.offsetHeight + 20; 
    const padding = 10;
    const dotSize = 50;

    const maxX = window.innerWidth - dotSize - padding;
    const maxY = window.innerHeight - dotSize - padding - buttonHeight;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    dot.style.left = `${randomX}px`;
    dot.style.top = `${randomY}px`;

}

// Klick auf Punkt → Zähler erhöhen + Punkt teleportieren
dot.addEventListener('click', () => {
    counter++;
    counterDisplay.innerText = counter;
    teleportDot();  // Punkt bewegt sich bei Klick
});

// Startposition beim Laden
window.addEventListener('load', () => {
    teleportDot();
    counterDisplay.innerText = counter;
});

// Punkt bewegt sich auch, wenn Fenstergröße geändert wird
window.addEventListener('resize', () => {
    teleportDot();
});
