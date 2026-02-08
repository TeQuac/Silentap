const dot = document.getElementById('dot');
const counter = document.getElementById('counter');
let taps = 0;

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

dot.addEventListener('click', moveDot);
