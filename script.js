const dot = document.getElementById('dot');
const supportButton = document.getElementById('supportButton'); // Dein Support-Button
const dotSize = 50; // Größe des Punktes in px (wie im CSS definiert)

// Teleport-Funktion
function teleportDot() {
    const padding = 10; // Abstand zum Rand
    const buttonHeight = supportButton.offsetHeight + 20; // Abstand über Support-Button

    // Begrenzung des Bereichs, in dem der Punkt erscheinen darf
    const maxX = window.innerWidth - dotSize - padding;
    const maxY = window.innerHeight - dotSize - padding - buttonHeight;
    const minX = padding;
    const minY = padding;

    // Zufällige Position innerhalb der Grenzen
    const randomX = Math.floor(Math.random() * (maxX - minX) + minX);
    const randomY = Math.floor(Math.random() * (maxY - minY) + minY);

    dot.style.left = randomX + "px";
    dot.style.top = randomY + "px";
}

// Beispiel: Klick auf Punkt
dot.addEventListener('click', () => {
    teleportDot();
    counter++; // Zähler wie bisher
    document.getElementById('counter').innerText = counter;
});
