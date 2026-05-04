/* ===================================
   FLORES MORADAS - SCRIPT.JS
   =================================== */

// ---- CONFIGURACIÓN ----
const CONFIG = {
  numStars: 200,
  numShootingStars: 5,
  numFlowers: 18,
  numPetals: 30,
  flowerEmojis: ['🌸', '💜', '🌺', '💐', '🌷', '✿', '❋'],
  shootingStarInterval: 3000,
  flowerInterval: 1800,
  petalInterval: 1200,
};

// ---- ESTADO ----
let envelopeOpen = false;
let musicPlaying = false;
let audioCtx = null;
let musicNodes = [];
let shootingStarTimer = null;
let flowerTimer = null;
let petalTimer = null;

// ---- INICIALIZACIÓN ----
document.addEventListener('DOMContentLoaded', () => {
  createStarfield();
  startShootingStars();
  startFlowers();
  startPetals();
  setupEnvelope();
  setupMusic();
  setupBackButton();
});

// ---- CAMPO DE ESTRELLAS (CANVAS) ----
function createStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    drawStars(ctx);
  }

  function drawStars(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < CONFIG.numStars; i++) {
      const x    = Math.random() * canvas.width;
      const y    = Math.random() * canvas.height;
      const r    = Math.random() * 1.5 + 0.3;
      const alpha = Math.random() * 0.7 + 0.3;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }
  }

  // Parpadeo continuo de estrellas
  let stars = [];
  function initStars() {
    stars = [];
    for (let i = 0; i < CONFIG.numStars; i++) {
      stars.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.4 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.01 + 0.003,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function animateStars(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(animateStars);
  }

  resize();
  initStars();
  requestAnimationFrame(animateStars);
  window.addEventListener('resize', () => { resize(); initStars(); });
}

// ---- ESTRELLAS FUGACES ----
function createShootingStar() {
  const el = document.createElement('div');
  el.classList.add('shooting-star');
  document.body.appendChild(el);

  const startX = Math.random() * window.innerWidth * 0.7;
  const startY = Math.random() * window.innerHeight * 0.4;
  const angle  = Math.random() * 30 + 30; // 30–60 grados

  el.style.left = startX + 'px';
  el.style.top  = startY + 'px';
  el.style.transform = `rotate(${angle}deg)`;

  const dist    = Math.random() * 300 + 200;
  const radians = (angle * Math.PI) / 180;
  const endX    = dist * Math.cos(radians);
  const endY    = dist * Math.sin(radians);
  const duration = Math.random() * 600 + 500;

  el.animate([
    { opacity: 0,   transform: `rotate(${angle}deg) translate(0, 0)` },
    { opacity: 1,   transform: `rotate(${angle}deg) translate(${endX * 0.1}px, ${endY * 0.1}px)`, offset: 0.1 },
    { opacity: 0.8, transform: `rotate(${angle}deg) translate(${endX * 0.5}px, ${endY * 0.5}px)`, offset: 0.5 },
    { opacity: 0,   transform: `rotate(${angle}deg) translate(${endX}px, ${endY}px)` },
  ], { duration, easing: 'ease-out', fill: 'forwards' }).onfinish = () => el.remove();
}

function startShootingStars() {
  createShootingStar();
  shootingStarTimer = setInterval(() => {
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
      setTimeout(createShootingStar, i * 300);
    }
  }, CONFIG.shootingStarInterval);
}

// ---- FLORES FLOTANTES ----
function createFloatingFlower() {
  const el = document.createElement('div');
  el.classList.add('flower');
  document.body.appendChild(el);

  el.textContent = CONFIG.flowerEmojis[Math.floor(Math.random() * CONFIG.flowerEmojis.length)];
  el.style.left     = Math.random() * 100 + 'vw';
  el.style.bottom   = '-60px';
  el.style.fontSize = (Math.random() * 1.5 + 1.2) + 'rem';

  const duration = Math.random() * 8000 + 7000;
  const drift    = (Math.random() - 0.5) * 150;

  el.animate([
    { opacity: 0,   transform: 'translateY(0) translateX(0) rotate(0deg) scale(1)' },
    { opacity: 0.9, transform: `translateY(-30vh) translateX(${drift * 0.3}px) rotate(60deg) scale(1.1)`, offset: 0.15 },
    { opacity: 0.7, transform: `translateY(-70vh) translateX(${drift * 0.7}px) rotate(180deg) scale(0.9)`, offset: 0.6 },
    { opacity: 0,   transform: `translateY(-115vh) translateX(${drift}px) rotate(360deg) scale(0.5)` },
  ], { duration, easing: 'ease-in-out', fill: 'forwards' }).onfinish = () => el.remove();
}

function startFlowers() {
  createFloatingFlower();
  flowerTimer = setInterval(createFloatingFlower, CONFIG.flowerInterval);
}

// ---- PÉTALOS CAYENDO ----
function createPetal() {
  const el = document.createElement('div');
  el.classList.add('petal');
  document.body.appendChild(el);

  el.style.left    = Math.random() * 100 + 'vw';
  el.style.top     = '-20px';
  el.style.width   = (Math.random() * 8 + 8) + 'px';
  el.style.height  = (Math.random() * 10 + 12) + 'px';
  el.style.borderRadius = Math.random() > 0.5 ? '50% 0 50% 0' : '0 50% 0 50%';

  const purples = [
    'linear-gradient(135deg, #b06fd8, #7b2d8b)',
    'linear-gradient(135deg, #c77dff, #ff79c6)',
    'linear-gradient(135deg, #e0b0ff, #b06fd8)',
    'linear-gradient(135deg, #ff79c6, #c77dff)',
  ];
  el.style.background = purples[Math.floor(Math.random() * purples.length)];

  const duration = Math.random() * 6000 + 5000;
  const driftX   = (Math.random() - 0.5) * 200;

  el.animate([
    { opacity: 0,   transform: 'translateY(-20px) translateX(0) rotate(0deg)' },
    { opacity: 0.8, transform: `translateY(30vh) translateX(${driftX * 0.3}px) rotate(180deg)`, offset: 0.3 },
    { opacity: 0.5, transform: `translateY(70vh) translateX(${driftX * 0.7}px) rotate(450deg)`, offset: 0.7 },
    { opacity: 0,   transform: `translateY(110vh) translateX(${driftX}px) rotate(720deg)` },
  ], { duration, easing: 'linear', fill: 'forwards' }).onfinish = () => el.remove();
}

function startPetals() {
  createPetal();
  petalTimer = setInterval(createPetal, CONFIG.petalInterval);
}

// ---- SOBRE / ENVELOPE ----
function setupEnvelope() {
  const envContainer = document.getElementById('envelope-container');
  const btnOpen      = document.getElementById('btn-open');

  if (!envContainer || !btnOpen) return;

  function openEnvelope() {
    if (envelopeOpen) return;
    envelopeOpen = true;

    const flap    = document.querySelector('.envelope-flap');
    const letter  = document.querySelector('.letter-preview');
    const seal    = document.querySelector('.envelope-seal');

    if (flap)   flap.classList.add('open');
    if (seal)   seal.classList.add('hidden');
    if (letter) letter.classList.add('rising');

    // Efecto de corazones al abrir
    burstHearts(envContainer);

    // Mostrar pantalla de carta
    setTimeout(() => {
      const welcomeScreen = document.getElementById('welcome-screen');
      const letterScreen  = document.getElementById('letter-screen');

      if (welcomeScreen) {
        welcomeScreen.style.animation = 'fadeOut 0.5s ease forwards';
        welcomeScreen.style.opacity   = '0';
        welcomeScreen.style.transform = 'scale(0.95)';
        welcomeScreen.style.transition = 'all 0.5s ease';
      }

      setTimeout(() => {
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (letterScreen)  letterScreen.classList.add('active');
      }, 500);

    }, 900);
  }

  envContainer.addEventListener('click', openEnvelope);
  btnOpen.addEventListener('click', openEnvelope);
}

function burstHearts(origin) {
  const rect = origin.getBoundingClientRect();
  const cx   = rect.left + rect.width / 2;
  const cy   = rect.top  + rect.height / 2;
  const emojis = ['💜', '🌸', '✨', '💫', '💕'];

  for (let i = 0; i < 16; i++) {
    const el = document.createElement('div');
    el.classList.add('heart-particle');
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left    = cx + 'px';
    el.style.top     = cy + 'px';
    el.style.fontSize = (Math.random() * 0.8 + 0.8) + 'rem';
    document.body.appendChild(el);

    const angle = (i / 16) * Math.PI * 2;
    const dist  = Math.random() * 120 + 60;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist;

    el.animate([
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      { opacity: 0, transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.2)` },
    ], { duration: 1000, easing: 'ease-out', fill: 'forwards' }).onfinish = () => el.remove();
  }
}

// ---- BOTÓN VOLVER ----
function setupBackButton() {
  const btnBack = document.getElementById('btn-back');
  if (!btnBack) return;

  btnBack.addEventListener('click', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const letterScreen  = document.getElementById('letter-screen');

    if (letterScreen) letterScreen.classList.remove('active');

    setTimeout(() => {
      if (welcomeScreen) {
        welcomeScreen.style.display    = 'flex';
        welcomeScreen.style.opacity    = '0';
        welcomeScreen.style.transform  = 'scale(0.95)';
        welcomeScreen.style.transition = 'all 0.6s ease';
        setTimeout(() => {
          welcomeScreen.style.opacity   = '1';
          welcomeScreen.style.transform = 'scale(1)';
        }, 50);
      }

      // Reset del sobre
      envelopeOpen = false;
      const flap   = document.querySelector('.envelope-flap');
      const letter = document.querySelector('.letter-preview');
      const seal   = document.querySelector('.envelope-seal');
      if (flap)   flap.classList.remove('open');
      if (seal)   seal.classList.remove('hidden');
      if (letter) letter.classList.remove('rising');

    }, 300);
  });
}

// ---- MÚSICA (WEB AUDIO API) ----
function setupMusic() {
  const musicBar = document.getElementById('music-bar');
  if (!musicBar) return;
  musicBar.addEventListener('click', toggleMusic);
}

function toggleMusic() {
  const icon   = document.getElementById('music-icon');
  const waves  = document.getElementById('music-waves');
  const musicBar = document.getElementById('music-bar');

  if (!musicPlaying) {
    startMusic();
    musicPlaying = true;
    if (icon)  icon.classList.remove('paused');
    if (waves) waves.classList.remove('paused');
    if (musicBar) musicBar.setAttribute('aria-label', 'Pausar música');
  } else {
    stopMusic();
    musicPlaying = false;
    if (icon)  icon.classList.add('paused');
    if (waves) waves.classList.add('paused');
    if (musicBar) musicBar.setAttribute('aria-label', 'Reproducir música');
  }
}

function startMusic() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Melodía romántica simple usando osciladores
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    const melody = [4,5,6,5,4,3,2,1, 3,4,5,4,3,2,1,0, 2,3,4,3,2,1,0,2, 5,6,7,6,5,4,3,2];
    const beatDuration = 0.35;

    musicNodes = [];

    melody.forEach((noteIdx, i) => {
      const osc    = audioCtx.createOscillator();
      const gain   = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      filter.type      = 'lowpass';
      filter.frequency.value = 800;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = i % 3 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = notes[noteIdx];

      const startTime = audioCtx.currentTime + i * beatDuration;
      const endTime   = startTime + beatDuration * 0.8;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, endTime);

      osc.start(startTime);
      osc.stop(endTime + 0.1);
      musicNodes.push(osc);
    });

    // Loop
    const totalDuration = melody.length * beatDuration * 1000;
    musicNodes._loopTimer = setTimeout(() => {
      if (musicPlaying) startMusic();
    }, totalDuration);

  } catch (e) {
    console.warn('Audio no disponible:', e);
  }
}

function stopMusic() {
  try {
    if (musicNodes._loopTimer) clearTimeout(musicNodes._loopTimer);
    musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
    musicNodes = [];
  } catch(e) {}
}

// ---- EFECTO PARALLAX SUAVE EN MOUSE ----
document.addEventListener('mousemove', (e) => {
  const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
  const my = (e.clientY / window.innerHeight - 0.5) * 2;

  const envContainer = document.getElementById('envelope-container');
  if (envContainer && !envelopeOpen) {
    envContainer.style.transform = `perspective(800px) rotateY(${mx * 5}deg) rotateX(${-my * 3}deg) scale(1.02)`;
  }
});

document.addEventListener('mouseleave', () => {
  const envContainer = document.getElementById('envelope-container');
  if (envContainer) envContainer.style.transform = '';
});

// ---- CLICS EN PANTALLA → corazones ----
document.addEventListener('click', (e) => {
  // No disparar en botones
  if (e.target.closest('button') || e.target.closest('#envelope-container') || e.target.closest('.music-bar')) return;

  const el = document.createElement('div');
  el.classList.add('heart-particle');
  el.textContent = ['💜','🌸','✨'][Math.floor(Math.random() * 3)];
  el.style.left     = e.clientX + 'px';
  el.style.top      = e.clientY + 'px';
  el.style.fontSize = '1.2rem';
  document.body.appendChild(el);

  el.animate([
    { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
    { opacity: 0, transform: 'translate(-50%, -200%) scale(0.5)' },
  ], { duration: 800, easing: 'ease-out', fill: 'forwards' }).onfinish = () => el.remove();
});