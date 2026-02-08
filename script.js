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
function moveDot() {
  const maxX = window.innerWidth - dot.offsetWidth;
  const maxY = window.innerHeight - dot.offsetHeight;
  const newX = Math.random() * maxX;
  const newY = Math.random() * maxY;
  dot.style.left = newX + 'px';
  dot.style.top = newY + 'px';
  taps++;
  counter.textContent = 'Taps: ' + taps;
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
