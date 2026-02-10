const dot = document.getElementById('dot');
const counter = document.getElementById('counter');
const gameHighscore = document.getElementById('game-highscore');
const missesDisplay = document.getElementById('misses');
const donate = document.getElementById('donate');

const usernameOverlay = document.getElementById('username-overlay');
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const usernameError = document.getElementById('username-error');

const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const usernameValue = document.getElementById('username-value');
const userHighscoreValue = document.getElementById('user-highscore-value');
const highscoreTrack = document.getElementById('highscore-track');

const storageKeys = {
  currentUser: 'silentapCurrentUser'
};

let taps = 0;
let misses = 0;
let gameActive = false;
const maxMisses = 2;
let currentUser = null;
let movementAnimation = null;
let movementState = null;

const gameElements = [dot, counter, gameHighscore, missesDisplay, donate].filter(Boolean);
const avoidElements = [counter, gameHighscore, missesDisplay, donate].filter(Boolean);

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function getTopUsers() {
  const result = await fetchJson('/api/users/top');
  return Array.isArray(result.users) ? result.users : [];
}

async function getUserRecord(name) {
  const result = await fetchJson(`/api/users/${encodeURIComponent(name)}`);
  return result.user;
}

async function createUser(name) {
  const result = await fetchJson('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
  return result.user;
}

async function updateUserHighscore(name, highscore) {
  const result = await fetchJson(`/api/users/${encodeURIComponent(name)}/highscore`, {
    method: 'PATCH',
    body: JSON.stringify({ highscore })
  });
  return result.user;
}

async function updateTicker() {
  try {
    const topTen = await getTopUsers();

    if (topTen.length === 0) {
      highscoreTrack.textContent = 'Noch keine Highscores';
      return;
    }

    const text = topTen
      .map((entry, index) => `${index + 1}. ${entry.name} - ${entry.highscore}`)
      .join(' • ');

    highscoreTrack.textContent = `${text} • ${text}`;
  } catch {
    highscoreTrack.textContent = 'Top-10 aktuell nicht erreichbar';
  }
}

function setCurrentUser(user) {
  currentUser = user.name;
  localStorage.setItem(storageKeys.currentUser, user.name);

  usernameValue.textContent = user.name;
  userHighscoreValue.textContent = String(user.highscore);
  gameHighscore.textContent = `Highscore: ${user.highscore}`;
}

async function updateCurrentUserHighscore(newScore) {
  if (!currentUser) return;

  const currentShownHighscore = Number(userHighscoreValue.textContent || '0');
  if (newScore <= currentShownHighscore) return;

  try {
    const updatedUser = await updateUserHighscore(currentUser, newScore);
    userHighscoreValue.textContent = String(updatedUser.highscore);
    gameHighscore.textContent = `Highscore: ${updatedUser.highscore}`;
    await updateTicker();
  } catch {
    // Ignore network/database errors during gameplay
  }
}

function showStartMenu() {
  usernameOverlay.classList.add('hidden');
  startScreen.classList.remove('hidden');
  startButton.disabled = false;
}

function showUsernameOverlay(message = '') {
  startScreen.classList.add('hidden');
  usernameOverlay.classList.remove('hidden');
  usernameInput.value = '';

  if (message) {
    usernameError.textContent = message;
    usernameError.classList.remove('hidden');
  } else {
    usernameError.textContent = '';
    usernameError.classList.add('hidden');
  }

  startButton.disabled = true;
}

async function initUserFlow() {
  await updateTicker();
  const savedUser = localStorage.getItem(storageKeys.currentUser);

  if (!savedUser) {
    showUsernameOverlay();
    return;
  }

  try {
    const user = await getUserRecord(savedUser);
    setCurrentUser(user);
    showStartMenu();
  } catch {
    showUsernameOverlay('Gespeicherter User wurde nicht gefunden. Bitte neu wählen.');
  }
}

function setGameActive(active) {
  gameActive = active;
  gameElements.forEach((element) => {
    element.classList.toggle('hidden', !active);
    element.hidden = !active;
  });

  startScreen.classList.toggle('hidden', active);

  if (active) {
    taps = 0;
    misses = 0;
    counter.textContent = 'Taps: 0';
    missesDisplay.textContent = `Misses: 0/${maxMisses}`;
    resetDot();
  } else if (movementAnimation) {
    cancelAnimationFrame(movementAnimation);
    movementAnimation = null;
    movementState = null;
  }
}

function getDotPosition() {
  return {
    left: parseFloat(dot.style.left) || 0,
    top: parseFloat(dot.style.top) || 0
  };
}

function startMovement(previousPosition, nextPosition) {
  const directionX = nextPosition.left - previousPosition.left;
  const directionY = nextPosition.top - previousPosition.top;
  const length = Math.hypot(directionX, directionY) || 1;

  movementState = {
    position: { ...nextPosition },
    velocity: 0.4,
    direction: {
      x: directionX / length,
      y: directionY / length
    }
  };

  const padding = 10;

  const animate = () => {
    if (!movementState || !gameActive) return;

    const dotSize = dot.offsetWidth;
    const minX = padding;
    const minY = padding;
    const maxX = Math.max(minX, window.innerWidth - dotSize - padding);
    const maxY = Math.max(minY, window.innerHeight - dotSize - padding);

    movementState.velocity = Math.min(movementState.velocity + 0.04, 8);
    movementState.position.left += movementState.direction.x * movementState.velocity;
    movementState.position.top += movementState.direction.y * movementState.velocity;

    if (movementState.position.left <= minX || movementState.position.left >= maxX) {
      movementState.position.left = Math.min(Math.max(movementState.position.left, minX), maxX);
      movementState.direction.x *= -1;
    }

    if (movementState.position.top <= minY || movementState.position.top >= maxY) {
      movementState.position.top = Math.min(Math.max(movementState.position.top, minY), maxY);
      movementState.direction.y *= -1;
    }

    dot.style.left = `${movementState.position.left}px`;
    dot.style.top = `${movementState.position.top}px`;

    movementAnimation = requestAnimationFrame(animate);
  };

  if (movementAnimation) {
    cancelAnimationFrame(movementAnimation);
  }
  movementAnimation = requestAnimationFrame(animate);
}

function moveDot() {
  const padding = 10;
  const avoidRects = avoidElements.map((element) => element.getBoundingClientRect());
  const dotSize = dot.offsetWidth;
  const minX = padding;
  const minY = padding;
  const maxX = Math.max(minX, window.innerWidth - dotSize - padding);
  const maxY = Math.max(minY, window.innerHeight - dotSize - padding);

  const previousPosition = getDotPosition();
  let newX = previousPosition.left;
  let newY = previousPosition.top;

  const overlapsRect = (rectA, rectB) => !(
    rectA.right < rectB.left ||
    rectA.left > rectB.right ||
    rectA.bottom < rectB.top ||
    rectA.top > rectB.bottom
  );

  for (let attempt = 0; attempt < 25; attempt++) {
    const candidateX = Math.random() * (maxX - minX) + minX;
    const candidateY = Math.random() * (maxY - minY) + minY;
    const dotRect = {
      left: candidateX,
      right: candidateX + dotSize,
      top: candidateY,
      bottom: candidateY + dotSize
    };

    const overlapsAvoid = avoidRects.some((rect) => overlapsRect(dotRect, rect));
    newX = candidateX;
    newY = candidateY;

    if (!overlapsAvoid) break;
  }

  const nextPosition = { left: newX, top: newY };
  dot.style.left = `${nextPosition.left}px`;
  dot.style.top = `${nextPosition.top}px`;
  startMovement(previousPosition, nextPosition);
}

function getCenteredPosition() {
  const dotSize = dot.offsetWidth;
  return {
    left: `${(window.innerWidth - dotSize) / 2}px`,
    top: `${(window.innerHeight - dotSize) / 2}px`
  };
}

function resetDot() {
  const centeredPosition = getCenteredPosition();
  dot.style.left = centeredPosition.left;
  dot.style.top = centeredPosition.top;

  if (movementAnimation) {
    cancelAnimationFrame(movementAnimation);
    movementAnimation = null;
  }

  movementState = null;
}

function hitDot() {
  taps++;
  counter.textContent = `Taps: ${taps}`;
  updateCurrentUserHighscore(taps);
  moveDot();
}

function handleTap(event) {
  if (!gameActive) return;

  const target = event.target;
  if (target === dot) {
    hitDot();
    return;
  }

  if (target === donate) return;

  misses++;
  missesDisplay.textContent = `Misses: ${misses}/${maxMisses}`;

  if (misses >= maxMisses) {
    taps = 0;
    misses = 0;
    counter.textContent = 'Taps: 0';
    missesDisplay.textContent = `Misses: 0/${maxMisses}`;
    resetDot();
  }
}

const isTouchDevice = 'ontouchstart' in window;
document.addEventListener(isTouchDevice ? 'touchstart' : 'click', handleTap);

window.addEventListener('resize', () => {
  if (gameActive) moveDot();
});

startButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (!currentUser) return;
  setGameActive(true);
});

startButton.addEventListener('touchstart', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (!currentUser) return;
  setGameActive(true);
}, { passive: false });

usernameForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = usernameInput.value.trim();

  if (name.length < 3) {
    showUsernameOverlay('Username muss mindestens 3 Zeichen lang sein.');
    return;
  }

  try {
    const user = await createUser(name);
    setCurrentUser(user);
    await updateTicker();
    showStartMenu();
  } catch (error) {
    if (error.status === 409) {
      showUsernameOverlay('Dieser Username ist bereits vergeben.');
      return;
    }

    showUsernameOverlay('Datenbank nicht erreichbar. Bitte später erneut versuchen.');
  }
});

setGameActive(false);
initUserFlow();
