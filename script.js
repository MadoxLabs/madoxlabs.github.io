/* =========================================================================
 * NEON DRIFT: OUTRUN PROTOCOL
 * Single-file vanilla JS arcade survival shooter.
 * Sections: utils, audio, input, particles, world, player, bullets,
 *           enemies, bosses, upgrades, render, ui, loop.
 * ========================================================================= */
"use strict";

// ---------- DOM refs ----------
const $ = (id) => document.getElementById(id);
const stage = $("stage");
const cv = $("game"), ctx = cv.getContext("2d");
const ov = $("overlay"), octx = ov.getContext("2d");
const mini = $("minimap"), mctx = mini.getContext("2d");

// ---------- Math / utility ----------
const TAU = Math.PI * 2;
const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const irand = (a, b) => Math.floor(rand(a, b));
const clamp = (v, lo, hi) => v < lo ? lo : (v > hi ? hi : v);
const lerp = (a, b, t) => a + (b - a) * t;
const choose = (arr) => arr[(Math.random() * arr.length) | 0];
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
const aabb = (a, b) =>
  Math.abs(a.x - b.x) < (a.r + b.r) && Math.abs(a.y - b.y) < (a.r + b.r);

// ---------- Global game state ----------
const G = {
  W: 0, H: 0, dpr: 1,
  scale: 1,
  state: "menu", // menu | controls | settings | playing | paused | upgrade | gameover
  prev: 0,
  fps: 0, fpsAcc: 0, fpsCount: 0,
  showFps: false,
  shakeOpt: true, scanOpt: true,
  shake: 0,
  hitstop: 0,
  slowmo: 1,
  slowmoTimer: 0,
  flash: 0, flashColor: "#fff",
  time: 0,         // game time seconds
  distance: 0,     // m
  speed: 380,      // base scroll px/s
  score: 0,
  combo: 1,
  comboTimer: 0,
  hi: +localStorage.getItem("nd_high") || 0,
  upgradeTimer: 0,
  bossTimer: 0,
  bossActive: null,
  warningTimer: 0,
  lastShot: 0,
  spawnTimer: 0,
  difficulty: 1,
  achQueue: [],
  achCooldown: 0,
};

// ---------- Settings persisted to LS ----------
const SETTINGS = JSON.parse(localStorage.getItem("nd_settings") || "{}");
const defaults = { master: 0.7, music: 0.5, sfx: 0.8, mute: false, shake: true, scan: true };
for (const k in defaults) if (!(k in SETTINGS)) SETTINGS[k] = defaults[k];
const saveSettings = () => localStorage.setItem("nd_settings", JSON.stringify(SETTINGS));

// =====================================================================
// AUDIO SYSTEM (Web Audio API — procedural SFX + synthwave music)
// =====================================================================
const Audio = (() => {
  let ctxA = null, master, sfx, music, musicGain;
  let musicStarted = false, musicNodes = [];
  let baseFreq = 110;
  let scale = [0, 3, 5, 7, 10]; // minor pentatonic-ish
  let beat = 0, lookahead = 0;

  const ensure = () => {
    if (ctxA) return;
    try {
      ctxA = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return; }
    master = ctxA.createGain(); master.gain.value = SETTINGS.mute ? 0 : SETTINGS.master;
    master.connect(ctxA.destination);
    sfx = ctxA.createGain(); sfx.gain.value = SETTINGS.sfx; sfx.connect(master);
    music = ctxA.createGain(); music.gain.value = SETTINGS.music; music.connect(master);
    // light reverb / filter on music
    musicGain = ctxA.createGain(); musicGain.gain.value = 1; musicGain.connect(music);
  };

  const setVol = () => {
    if (!ctxA) return;
    master.gain.value = SETTINGS.mute ? 0 : SETTINGS.master;
    sfx.gain.value = SETTINGS.sfx;
    music.gain.value = SETTINGS.music;
  };

  const beep = (freq, dur = 0.08, type = "square", vol = 0.3, slide = 0) => {
    if (!ctxA || SETTINGS.mute) return;
    const t = ctxA.currentTime;
    const o = ctxA.createOscillator();
    const g = ctxA.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfx);
    o.start(t); o.stop(t + dur + 0.02);
  };

  const noise = (dur = 0.2, vol = 0.4, freq = 1200) => {
    if (!ctxA || SETTINGS.mute) return;
    const t = ctxA.currentTime;
    const buf = ctxA.createBuffer(1, ctxA.sampleRate * dur, ctxA.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctxA.createBufferSource(); src.buffer = buf;
    const f = ctxA.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = freq;
    const g = ctxA.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(sfx);
    src.start(t); src.stop(t + dur);
  };

  const sfxShoot   = () => beep(880 + rand(-30, 30), 0.06, "square", 0.18, -300);
  const sfxHit     = () => { beep(220, 0.06, "sawtooth", 0.25, -100); noise(0.06, 0.18, 600); };
  const sfxBoom    = () => { noise(0.5, 0.55, 800); beep(110, 0.4, "triangle", 0.4, -60); };
  const sfxBigBoom = () => { noise(1.0, 0.7, 600); beep(80, 0.9, "sine", 0.55, -40); beep(220, 0.6, "square", 0.3, -180); };
  const sfxDamage  = () => { beep(180, 0.12, "square", 0.35, -120); noise(0.1, 0.2, 400); };
  const sfxBoost   = () => { beep(260, 0.25, "sawtooth", 0.2, 600); noise(0.25, 0.18, 1500); };
  const sfxUI      = () => beep(660, 0.05, "square", 0.18, 200);
  const sfxPickup  = () => { beep(700, 0.08, "triangle", 0.22, 300); beep(1100, 0.08, "triangle", 0.22, 200); };
  const sfxEMP     = () => { noise(0.6, 0.5, 4000); beep(1200, 0.4, "sine", 0.3, -1100); };
  const sfxBoss    = () => { beep(60, 1.4, "sawtooth", 0.5, 40); noise(0.3, 0.3, 200); };

  // -------- Procedural synthwave music (slow arpeggios + bassline) --------
  const startMusic = () => {
    ensure();
    if (musicStarted) return;
    musicStarted = true;
    lookahead = ctxA.currentTime + 0.1;
    musicTick();
  };

  const musicTick = () => {
    if (!ctxA) return;
    const beatDur = 0.32; // ~110bpm-ish quarters split
    while (lookahead < ctxA.currentTime + 0.3) {
      const step = beat % 16;
      // Bass on 1/9
      if (step === 0 || step === 8) {
        synthNote(baseFreq * 0.5, lookahead, beatDur * 1.6, "triangle", 0.15);
      }
      // Arp every 2nd step
      if (step % 2 === 0) {
        const note = scale[(beat / 2) % scale.length | 0];
        const f = baseFreq * Math.pow(2, note / 12);
        synthNote(f * 2, lookahead, beatDur * 0.9, "sawtooth", 0.06);
      }
      // Pad sweep every 16
      if (step === 4) synthPad(baseFreq * 2, lookahead, beatDur * 6);
      lookahead += beatDur;
      beat++;
    }
    setTimeout(musicTick, 80);
  };

  const synthNote = (freq, t, dur, type, vol) => {
    const o = ctxA.createOscillator(), g = ctxA.createGain(), f = ctxA.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 1200;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + dur + 0.02);
  };
  const synthPad = (freq, t, dur) => {
    const o = ctxA.createOscillator(), g = ctxA.createGain(), f = ctxA.createBiquadFilter();
    f.type = "lowpass"; f.frequency.setValueAtTime(400, t);
    f.frequency.linearRampToValueAtTime(2200, t + dur * 0.5);
    f.frequency.linearRampToValueAtTime(600, t + dur);
    o.type = "sawtooth"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + dur + 0.05);
  };

  return {
    ensure, setVol, startMusic,
    shoot: sfxShoot, hit: sfxHit, boom: sfxBoom, bigBoom: sfxBigBoom,
    damage: sfxDamage, boost: sfxBoost, ui: sfxUI, pickup: sfxPickup,
    emp: sfxEMP, boss: sfxBoss
  };
})();

// =====================================================================
// INPUT SYSTEM (keyboard + touch)
// =====================================================================
const Input = {
  keys: Object.create(null),
  pressed: Object.create(null),
  touch: { active: false, dx: 0, dy: 0, fire: false, boost: false },

  init() {
    window.addEventListener("keydown", (e) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
      const k = e.key.toLowerCase();
      if (!this.keys[k]) this.pressed[k] = true;
      this.keys[k] = true;
      // Toggles
      if (k === "p" || k === "escape") UI.togglePause();
      if (k === "m") { SETTINGS.mute = !SETTINGS.mute; saveSettings(); Audio.setVol(); UI.refreshSettings(); }
      if (k === "f") G.showFps = !G.showFps;
    }, { passive: false });
    window.addEventListener("keyup", (e) => { this.keys[e.key.toLowerCase()] = false; });
    window.addEventListener("blur", () => { this.keys = Object.create(null); });

    // Touch joystick
    const stick = $("tstick"), knob = $("tknob");
    let sx = 0, sy = 0, sActive = false;
    const touchStart = (e) => {
      e.preventDefault();
      const t = e.touches[0]; const r = stick.getBoundingClientRect();
      sx = r.left + r.width / 2; sy = r.top + r.height / 2; sActive = true;
      this.touch.active = true; touchMove(e);
    };
    const touchMove = (e) => {
      if (!sActive) return;
      const t = e.touches[0]; let dx = t.clientX - sx, dy = t.clientY - sy;
      const m = Math.hypot(dx, dy), max = 50;
      if (m > max) { dx = dx / m * max; dy = dy / m * max; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.touch.dx = dx / max; this.touch.dy = dy / max;
    };
    const touchEnd = () => {
      sActive = false; this.touch.dx = 0; this.touch.dy = 0;
      knob.style.transform = "translate(0,0)";
    };
    stick.addEventListener("touchstart", touchStart, { passive: false });
    stick.addEventListener("touchmove", touchMove, { passive: false });
    stick.addEventListener("touchend", touchEnd);

    const fireBtn = $("tfire"), boostBtn = $("tboost");
    fireBtn.addEventListener("touchstart", (e) => { e.preventDefault(); this.touch.fire = true; });
    fireBtn.addEventListener("touchend",   (e) => { e.preventDefault(); this.touch.fire = false; });
    boostBtn.addEventListener("touchstart",(e) => { e.preventDefault(); this.touch.boost = true; });
    boostBtn.addEventListener("touchend",  (e) => { e.preventDefault(); this.touch.boost = false; });
  },

  axis() {
    let x = 0, y = 0;
    if (this.keys["arrowleft"]  || this.keys["a"]) x -= 1;
    if (this.keys["arrowright"] || this.keys["d"]) x += 1;
    if (this.keys["arrowup"]    || this.keys["w"]) y -= 1;
    if (this.keys["arrowdown"]  || this.keys["s"]) y += 1;
    x += this.touch.dx; y += this.touch.dy;
    const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
    return { x, y };
  },
  firing()  { return this.keys[" "] || this.keys["space"] || this.touch.fire; },
  boosting() { return this.keys["shift"] || this.touch.boost; },
  empPressed() { const p = this.pressed["q"]; if (p) this.pressed["q"] = false; return p; },
  slowPressed() { const p = this.pressed["e"]; if (p) this.pressed["e"] = false; return p; },
  consumePressed() { this.pressed = Object.create(null); }
};

// =====================================================================
// OBJECT POOLS (lightweight)
// =====================================================================
function pool(create) {
  const live = [], dead = [];
  return {
    live, dead,
    spawn(init) {
      const o = dead.pop() || create();
      init(o); o._dead = false; live.push(o);
      return o;
    },
    sweep() {
      for (let i = live.length - 1; i >= 0; i--) {
        if (live[i]._dead) { dead.push(live[i]); live.splice(i, 1); }
      }
    },
    clear() { while (live.length) dead.push(live.pop()); }
  };
}

// =====================================================================
// PARTICLES
// =====================================================================
const Particles = pool(() => ({
  x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1,
  size: 2, color: "#fff", glow: 1, drag: 0.96, _dead: false
}));

function spawnBurst(x, y, count, opts = {}) {
  const speed = opts.speed || 240;
  const color = opts.color || "#0ff";
  const size = opts.size || 3;
  const life = opts.life || 0.5;
  const drag = opts.drag || 0.94;
  for (let i = 0; i < count; i++) {
    const a = rand(0, TAU), v = rand(speed * 0.3, speed);
    Particles.spawn(p => {
      p.x = x; p.y = y;
      p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v;
      p.life = p.maxLife = life * rand(0.6, 1.2);
      p.size = size * rand(0.6, 1.4);
      p.color = color; p.glow = 1; p.drag = drag;
    });
  }
}
function spawnTrail(x, y, color = "#0ff") {
  Particles.spawn(p => {
    p.x = x; p.y = y;
    p.vx = rand(-30, 30); p.vy = rand(40, 120);
    p.life = p.maxLife = rand(0.25, 0.5);
    p.size = rand(1.5, 3); p.color = color; p.glow = 1; p.drag = 0.92;
  });
}

// =====================================================================
// FLOATING DEBRIS / BACKGROUND PARTICLES
// =====================================================================
const Debris = [];
function initDebris() {
  Debris.length = 0;
  for (let i = 0; i < 60; i++) {
    Debris.push({
      x: rand(0, G.W), y: rand(0, G.H),
      vy: rand(60, 220), size: rand(1, 3),
      color: choose(["#0ff", "#f0f", "#5ff", "#a0f"])
    });
  }
}

// Forward decls populated below in further appends
let Player = null;
const Bullets = pool(() => ({ x:0,y:0,vx:0,vy:0,r:4,dmg:1,life:1.4,color:"#0ff",homing:0,pierce:0,fromPlayer:true,_dead:false,trail:[] }));
const Enemies = pool(() => null);
const Pickups = pool(() => null);
const FloatTexts = pool(() => ({ x:0,y:0,text:"",color:"#fff",life:1,maxLife:1,vy:-40,_dead:false }));

// =====================================================================
// PLAYER
// =====================================================================
function createPlayer() {
  return {
    x: G.W / 2, y: G.H * 0.75,
    vx: 0, vy: 0,
    r: 16,
    angle: 0,             // visual lean angle
    targetAngle: 0,
    hp: 100, maxHp: 100,
    shield: 0, maxShield: 60, shieldRegen: 6, // per second
    shieldDelay: 0,
    energy: 100, maxEnergy: 100, energyRegen: 18,
    fireRate: 6.5,        // shots/sec
    fireCooldown: 0,
    bulletDmg: 1,
    speed: 360,
    boostMult: 1.85,
    boosting: false,
    invuln: 0,
    upgrades: {
      doubleShot: false, tripleShot: false, fasterFire: 0,
      shieldRegen: 0, moreBoost: 0, emp: false, homing: false,
      pierce: 0, slowmo: false, healthBoost: 0
    },
    empCharges: 0, empCooldown: 0,
    slowmoCharges: 0, slowmoCooldown: 0,
    nearMissTimer: 0,
  };
}

function playerFire() {
  if (Player.fireCooldown > 0 || Player.hp <= 0) return;
  const fireDelay = 1 / (Player.fireRate * (1 + Player.upgrades.fasterFire * 0.25));
  Player.fireCooldown = fireDelay;
  const sx = Player.x, sy = Player.y - Player.r;
  const dmg = Player.bulletDmg;
  const pierce = Player.upgrades.pierce;
  const homing = Player.upgrades.homing ? 1 : 0;

  const shoot = (off, angle = 0) => {
    Bullets.spawn(b => {
      b.x = sx + off; b.y = sy;
      b.vx = Math.sin(angle) * 900; b.vy = -Math.cos(angle) * 900;
      b.r = 4; b.dmg = dmg; b.life = 1.4; b.color = "#0ff";
      b.homing = homing; b.pierce = pierce; b.fromPlayer = true;
      b.trail.length = 0;
    });
  };

  if (Player.upgrades.tripleShot) {
    shoot(0, 0); shoot(-10, -0.18); shoot(10, 0.18);
  } else if (Player.upgrades.doubleShot) {
    shoot(-7, 0); shoot(7, 0);
  } else {
    shoot(0, 0);
  }
  Audio.shoot();
}

function playerDamage(amount) {
  if (Player.invuln > 0) return;
  let dmg = amount;
  if (Player.shield > 0) {
    const absorbed = Math.min(Player.shield, dmg);
    Player.shield -= absorbed; dmg -= absorbed;
  }
  if (dmg > 0) {
    Player.hp -= dmg;
    G.shake = Math.min(28, G.shake + dmg * 1.6);
    G.flash = 0.25; G.flashColor = "#ff4760";
    Audio.damage();
    G.combo = 1; G.comboTimer = 0;
  } else {
    Audio.hit();
  }
  Player.shieldDelay = 1.6;
  Player.invuln = 0.45;
  if (Player.hp <= 0) gameOver();
}

function triggerEMP() {
  if (!Player.upgrades.emp || Player.empCharges <= 0 || Player.empCooldown > 0) return;
  Player.empCharges--;
  Player.empCooldown = 6;
  Audio.emp(); Audio.bigBoom();
  G.shake = Math.max(G.shake, 18);
  G.flash = 0.4; G.flashColor = "#fff";
  // shock wave: damage all enemies within radius
  const R = Math.max(G.W, G.H) * 0.55;
  for (const e of Enemies.live) {
    const d = Math.hypot(e.x - Player.x, e.y - Player.y);
    if (d < R) {
      damageEnemy(e, 4);
    }
  }
  // destroy enemy bullets
  for (const b of Bullets.live) if (!b.fromPlayer) b._dead = true;
  // particle ring
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * TAU;
    Particles.spawn(p => {
      p.x = Player.x; p.y = Player.y;
      p.vx = Math.cos(a) * 600; p.vy = Math.sin(a) * 600;
      p.life = p.maxLife = 0.6; p.size = 3;
      p.color = i % 2 ? "#0ff" : "#fff"; p.glow = 1; p.drag = 0.94;
    });
  }
  showAchievement("EMP DISCHARGED");
}

function triggerSlowmo() {
  if (!Player.upgrades.slowmo || Player.slowmoCharges <= 0 || G.slowmoTimer > 0) return;
  Player.slowmoCharges--;
  G.slowmoTimer = 3.5;
  Audio.ui();
  showAchievement("TIME SLOW");
}

// =====================================================================
// ENEMIES
// =====================================================================
const ENEMY_TYPES = {
  drone: {
    hp: 3, r: 14, color: "#ff2bd6", points: 100, fire: 1.4, fireRate: 0.8,
    init(e) { e.movePattern = "sine"; e.amp = rand(40, 130); e.phase = rand(0, TAU); e.baseX = e.x; e.speedY = rand(120, 200); }
  },
  fast: {
    hp: 2, r: 10, color: "#ffe25a", points: 150, fire: 0, fireRate: 0,
    init(e) { e.movePattern = "strafe"; e.speedY = rand(260, 340); e.zigT = 0; }
  },
  tank: {
    hp: 12, r: 22, color: "#8b3bff", points: 350, fire: 1.0, fireRate: 0.55,
    init(e) { e.movePattern = "slow"; e.speedY = rand(60, 100); }
  },
  kamikaze: {
    hp: 2, r: 12, color: "#ff4760", points: 200, fire: 0, fireRate: 0,
    init(e) { e.movePattern = "chase"; e.speedY = 200; e.chargeT = 0; }
  },
  formation: {
    hp: 4, r: 12, color: "#2b6bff", points: 200, fire: 1.2, fireRate: 0.6,
    init(e) { e.movePattern = "formation"; e.amp = 60; e.phase = rand(0, TAU); e.speedY = 140; e.baseX = e.x; }
  }
};

function spawnEnemy(type, x = null, y = null) {
  const def = ENEMY_TYPES[type];
  const e = {
    type, x: x === null ? rand(60, G.W - 60) : x, y: y === null ? -30 : y,
    vx: 0, vy: 0,
    hp: def.hp * (1 + (G.difficulty - 1) * 0.18),
    maxHp: def.hp * (1 + (G.difficulty - 1) * 0.18),
    r: def.r, color: def.color,
    fireCooldown: rand(0.5, 1.5) / def.fireRate || 99,
    fireRate: def.fireRate, points: def.points,
    movePattern: "", amp: 0, phase: 0, baseX: 0, speedY: 0,
    zigT: 0, chargeT: 0, hit: 0,
    isBoss: false, _dead: false
  };
  def.init(e);
  Enemies.live.push(e);
  return e;
}

function enemyAI(e, dt) {
  // Movement patterns
  switch (e.movePattern) {
    case "sine":
      e.x = e.baseX + Math.sin(G.time * 1.6 + e.phase) * e.amp;
      e.y += e.speedY * dt;
      break;
    case "strafe": {
      e.zigT += dt;
      e.vx = Math.sin(e.zigT * 4) * 220;
      e.x += e.vx * dt;
      e.y += e.speedY * dt;
      e.x = clamp(e.x, 30, G.W - 30);
      break;
    }
    case "slow":
      e.y += e.speedY * dt;
      e.x += Math.sin(G.time * 0.6) * 30 * dt;
      break;
    case "chase": {
      e.chargeT += dt;
      const dx = Player.x - e.x, dy = Player.y - e.y;
      const m = Math.hypot(dx, dy) || 1;
      const sp = e.chargeT > 0.6 ? 380 : 160;
      e.x += (dx / m) * sp * dt;
      e.y += (dy / m) * sp * dt;
      // trailing fire particles
      if (Math.random() < 0.6) spawnTrail(e.x, e.y, "#ff7766");
      break;
    }
    case "formation":
      e.x = e.baseX + Math.sin(G.time * 1.2 + e.phase) * e.amp;
      e.y += e.speedY * dt;
      break;
  }

  // Firing
  if (e.fireRate > 0 && e.y > 0) {
    e.fireCooldown -= dt;
    if (e.fireCooldown <= 0) {
      e.fireCooldown = 1 / (e.fireRate * (0.8 + G.difficulty * 0.05));
      // predictive fire
      const px = Player.x, py = Player.y;
      const dx = px - e.x, dy = py - e.y;
      const m = Math.hypot(dx, dy) || 1;
      const speed = 360;
      const t = m / speed;
      const ax = px + Player.vx * t * 0.5, ay = py + Player.vy * t * 0.5;
      const adx = ax - e.x, ady = ay - e.y; const am = Math.hypot(adx, ady) || 1;
      Bullets.spawn(b => {
        b.x = e.x; b.y = e.y; b.vx = adx / am * speed; b.vy = ady / am * speed;
        b.r = 5; b.dmg = 8; b.life = 3; b.color = "#ff2bd6";
        b.homing = 0; b.pierce = 0; b.fromPlayer = false; b.trail.length = 0;
      });
    }
  }

  // hit flash decay
  if (e.hit > 0) e.hit -= dt;

  if (e.y > G.H + 60 || e.x < -80 || e.x > G.W + 80) e._dead = true;
}

function damageEnemy(e, dmg) {
  if (e._dead) return;
  e.hp -= dmg;
  e.hit = 0.12;
  if (e.hp <= 0) destroyEnemy(e);
  else Audio.hit();
}

function destroyEnemy(e) {
  e._dead = true;
  spawnBurst(e.x, e.y, e.isBoss ? 80 : 24, { color: e.color, speed: e.isBoss ? 700 : 320, size: 3, life: 0.7 });
  spawnBurst(e.x, e.y, 14, { color: "#fff", speed: 200, size: 2, life: 0.4 });
  if (e.isBoss) {
    Audio.bigBoom();
    G.shake = 32; G.flash = 0.6; G.flashColor = "#fff";
    G.slowmoTimer = Math.max(G.slowmoTimer, 1.5);
    addScore(5000, e.x, e.y, "BOSS DOWN +5000");
    G.bossActive = null;
    showAchievement("BOSS DESTROYED");
  } else {
    Audio.boom();
    G.shake = Math.max(G.shake, 6);
    addScore(e.points, e.x, e.y);
  }
  G.hitstop = Math.max(G.hitstop, e.isBoss ? 0.18 : 0.04);
  // chance for a pickup
  if (!e.isBoss && Math.random() < 0.18) spawnPickup(e.x, e.y);
}

function addScore(pts, x = 0, y = 0, label) {
  const total = Math.round(pts * G.combo);
  G.score += total;
  G.combo = Math.min(20, G.combo + 0.15);
  G.comboTimer = 3.2;
  if (label || x) {
    FloatTexts.spawn(t => {
      t.x = x; t.y = y;
      t.text = label || ("+" + total + (G.combo > 1.5 ? ` x${G.combo.toFixed(1)}` : ""));
      t.color = G.combo > 5 ? "#ffe25a" : "#0ff";
      t.life = t.maxLife = 0.9; t.vy = -60;
    });
  }
}

// =====================================================================
// PICKUPS
// =====================================================================
function spawnPickup(x, y) {
  const types = ["energy", "shield", "health"];
  const type = choose(types);
  Pickups.live.push({
    type, x, y, r: 12,
    color: type === "energy" ? "#ffe25a" : type === "shield" ? "#ff2bd6" : "#7fff7f",
    vy: 80, t: 0, _dead: false
  });
}

function updatePickups(dt) {
  for (const p of Pickups.live) {
    p.t += dt;
    p.y += p.vy * dt;
    p.x += Math.sin(p.t * 3) * 30 * dt;
    if (dist2(p.x, p.y, Player.x, Player.y) < (p.r + Player.r) * (p.r + Player.r)) {
      collectPickup(p);
      p._dead = true;
    } else if (p.y > G.H + 30) p._dead = true;
  }
  for (let i = Pickups.live.length - 1; i >= 0; i--)
    if (Pickups.live[i]._dead) Pickups.live.splice(i, 1);
}
function collectPickup(p) {
  Audio.pickup();
  if (p.type === "energy")  Player.energy = Math.min(Player.maxEnergy, Player.energy + 35);
  if (p.type === "shield")  Player.shield = Math.min(Player.maxShield, Player.shield + 25);
  if (p.type === "health")  Player.hp = Math.min(Player.maxHp, Player.hp + 20);
  spawnBurst(p.x, p.y, 14, { color: p.color, speed: 220, size: 2, life: 0.4 });
  FloatTexts.spawn(t => {
    t.x = p.x; t.y = p.y; t.text = "+" + p.type.toUpperCase();
    t.color = p.color; t.life = t.maxLife = 0.9; t.vy = -50;
  });
}

// =====================================================================
// BOSSES
// =====================================================================
function spawnBoss() {
  const bossN = Math.floor(G.time / 90) + 1;
  const hp = 220 + bossN * 90;
  const e = {
    type: "boss", x: G.W / 2, y: -120,
    vx: 0, vy: 0,
    hp, maxHp: hp,
    r: 56, color: "#ff2bd6",
    fireRate: 0.9, fireCooldown: 2,
    points: 5000,
    movePattern: "boss", amp: 0, phase: 0, baseX: 0, speedY: 0,
    hit: 0, isBoss: true, _dead: false,
    phase2: false, attackT: 0, pattern: 0,
    targetX: G.W / 2, targetY: 110
  };
  Enemies.live.push(e);
  G.bossActive = e;
  G.warningTimer = 2.4;
  Audio.boss();
  showAchievement("!! BOSS APPROACHING !!");
}

function bossAI(e, dt) {
  // Entry
  e.x += (e.targetX - e.x) * 2 * dt;
  e.y += (e.targetY - e.y) * 2 * dt;
  e.attackT += dt;

  // Phase 2 below half hp
  if (!e.phase2 && e.hp < e.maxHp * 0.5) { e.phase2 = true; e.fireRate *= 1.4; G.flash = 0.4; G.flashColor = "#ff2bd6"; }

  // Wander
  if (e.attackT > 3) {
    e.attackT = 0;
    e.pattern = (e.pattern + 1) % 3;
    e.targetX = clamp(Player.x + rand(-200, 200), 80, G.W - 80);
    e.targetY = rand(80, 220);
  }

  // Attacks
  e.fireCooldown -= dt;
  if (e.fireCooldown <= 0) {
    e.fireCooldown = 1 / e.fireRate;
    const angBase = Math.atan2(Player.y - e.y, Player.x - e.x);
    if (e.pattern === 0) {
      // Spread
      const n = e.phase2 ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const a = angBase + (i - (n - 1) / 2) * 0.18;
        spawnEnemyBullet(e, a, 320, 10);
      }
    } else if (e.pattern === 1) {
      // Spiral
      const n = e.phase2 ? 12 : 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + e.attackT * 4;
        spawnEnemyBullet(e, a, 240, 8);
      }
      e.fireCooldown = 0.18;
    } else {
      // Aimed burst
      for (let i = 0; i < 3; i++) {
        const a = angBase + (i - 1) * 0.05;
        spawnEnemyBullet(e, a, 460, 12);
      }
    }
  }
  if (e.hit > 0) e.hit -= dt;
}

function spawnEnemyBullet(e, angle, speed, dmg) {
  Bullets.spawn(b => {
    b.x = e.x; b.y = e.y;
    b.vx = Math.cos(angle) * speed; b.vy = Math.sin(angle) * speed;
    b.r = 5; b.dmg = dmg; b.life = 4.5; b.color = "#ff2bd6";
    b.homing = 0; b.pierce = 0; b.fromPlayer = false; b.trail.length = 0;
  });
}

// =====================================================================
// UPGRADES
// =====================================================================
const UPGRADES = [
  { id: "double",  icon: "⫶", title: "DOUBLE SHOT",   desc: "Fire two parallel rounds.",     check: () => !Player.upgrades.doubleShot && !Player.upgrades.tripleShot, apply: () => Player.upgrades.doubleShot = true },
  { id: "triple",  icon: "⫷", title: "TRIPLE SHOT",   desc: "Fire three spread rounds.",       check: () => Player.upgrades.doubleShot && !Player.upgrades.tripleShot, apply: () => Player.upgrades.tripleShot = true },
  { id: "fast",    icon: "»",  title: "FAST FIRE",     desc: "Increase fire rate by 25%.",      check: () => Player.upgrades.fasterFire < 4, apply: () => Player.upgrades.fasterFire++ },
  { id: "shregen", icon: "◇",  title: "SHIELD REGEN",  desc: "Shield recovers faster.",         check: () => Player.upgrades.shieldRegen < 4, apply: () => { Player.upgrades.shieldRegen++; Player.shieldRegen += 4; Player.maxShield += 20; } },
  { id: "boost",   icon: "›",  title: "OVERDRIVE",     desc: "More boost energy.",              check: () => Player.upgrades.moreBoost < 4, apply: () => { Player.upgrades.moreBoost++; Player.maxEnergy += 30; Player.energy = Player.maxEnergy; } },
  { id: "emp",     icon: "✺", title: "EMP PULSE",     desc: "Q: shockwave damages all on screen.", check: () => !Player.upgrades.emp, apply: () => { Player.upgrades.emp = true; Player.empCharges = 3; } },
  { id: "empMore", icon: "✺", title: "EMP CAPACITY",  desc: "+2 EMP charges.",                  check: () => Player.upgrades.emp, apply: () => Player.empCharges += 2 },
  { id: "homing",  icon: "◉",  title: "HOMING ROUNDS", desc: "Bullets seek the nearest enemy.",  check: () => !Player.upgrades.homing, apply: () => Player.upgrades.homing = true },
  { id: "pierce",  icon: "→",  title: "PIERCING",      desc: "Bullets pierce one extra enemy.",  check: () => Player.upgrades.pierce < 3, apply: () => Player.upgrades.pierce++ },
  { id: "hp",      icon: "♥",  title: "REINFORCED",    desc: "+30 max hull, full repair.",        check: () => Player.upgrades.healthBoost < 4, apply: () => { Player.upgrades.healthBoost++; Player.maxHp += 30; Player.hp = Player.maxHp; } },
  { id: "slowmo",  icon: "◐",  title: "TIME DILATION", desc: "E: slow time briefly.",            check: () => !Player.upgrades.slowmo, apply: () => { Player.upgrades.slowmo = true; Player.slowmoCharges = 3; } },
  { id: "slowmoMore", icon: "◐", title: "DILATION+",   desc: "+2 Slow-Mo charges.",              check: () => Player.upgrades.slowmo, apply: () => Player.slowmoCharges += 2 }
];

function rollUpgrades() {
  const pool = UPGRADES.filter(u => u.check());
  // shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

function applyUpgrade(u) {
  u.apply();
  Audio.ui();
  showAchievement("UPGRADE: " + u.title);
}

// =====================================================================
// ACHIEVEMENTS / FLOATING UI MESSAGES
// =====================================================================
function showAchievement(text) { G.achQueue.push(text); }

function tickAchievements(dt) {
  G.achCooldown -= dt;
  if (G.achCooldown <= 0 && G.achQueue.length) {
    const a = $("achievement");
    a.textContent = G.achQueue.shift();
    a.classList.remove("hidden");
    void a.offsetWidth;
    a.style.animation = "none"; void a.offsetWidth; a.style.animation = "";
    G.achCooldown = 2.0;
    setTimeout(() => a.classList.add("hidden"), 1900);
  }
}

// =====================================================================
// SPAWNING / DIFFICULTY
// =====================================================================
function tickSpawner(dt) {
  G.spawnTimer -= dt;
  G.difficulty = 1 + G.time / 35;
  if (G.bossActive) return;
  if (G.spawnTimer <= 0) {
    G.spawnTimer = Math.max(0.18, 1.1 - G.difficulty * 0.05);
    const r = Math.random();
    const tier = Math.min(1, G.difficulty / 8);
    if (r < 0.45) spawnEnemy("drone");
    else if (r < 0.7) spawnEnemy("fast");
    else if (r < 0.83 && G.time > 20) spawnEnemy("tank");
    else if (r < 0.93 && G.time > 35) spawnEnemy("kamikaze");
    else if (G.time > 25) {
      // formation wave
      const cx = rand(120, G.W - 120);
      const n = 4 + Math.floor(tier * 3);
      for (let i = 0; i < n; i++) {
        const e = spawnEnemy("formation", cx + (i - (n - 1) / 2) * 50, -30 - i * 30);
      }
    } else spawnEnemy("drone");
  }
  // Random events
  if (Math.random() < 0.0015 * dt * 60) randomEvent();
}

function randomEvent() {
  const events = ["meteor", "swarm", "powerup"];
  const e = choose(events);
  if (e === "meteor") {
    showAchievement("DEBRIS FIELD");
    for (let i = 0; i < 5; i++)
      spawnEnemy("kamikaze", rand(80, G.W - 80), -30 - i * 60);
  } else if (e === "swarm") {
    showAchievement("DRONE SWARM");
    for (let i = 0; i < 8; i++) spawnEnemy("drone", rand(80, G.W - 80), -30 - i * 30);
  } else if (e === "powerup") {
    showAchievement("SUPPLY DROP");
    for (let i = 0; i < 3; i++) spawnPickup(rand(80, G.W - 80), -20);
  }
}

// =====================================================================
// RENDER — WORLD BACKGROUND (grid + city)
// =====================================================================
function renderBackground() {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, G.H);
  sky.addColorStop(0, "#1a0034");
  sky.addColorStop(0.45, "#0a0420");
  sky.addColorStop(1, "#02000a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, G.W, G.H);

  // Sun / horizon glow
  const horizonY = G.H * 0.45;
  const grd = ctx.createRadialGradient(G.W / 2, horizonY, 10, G.W / 2, horizonY, G.W * 0.45);
  grd.addColorStop(0, "rgba(255, 60, 200, 0.6)");
  grd.addColorStop(0.4, "rgba(140, 30, 180, 0.25)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, G.W, G.H);

  // Sun disc with horizontal stripes
  ctx.save();
  ctx.beginPath(); ctx.arc(G.W / 2, horizonY, 80, 0, TAU); ctx.clip();
  const sunGrad = ctx.createLinearGradient(0, horizonY - 80, 0, horizonY + 80);
  sunGrad.addColorStop(0, "#ffd76a"); sunGrad.addColorStop(0.5, "#ff5fbb"); sunGrad.addColorStop(1, "#7d2bff");
  ctx.fillStyle = sunGrad;
  ctx.fillRect(G.W / 2 - 80, horizonY - 80, 160, 160);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  for (let i = 0; i < 6; i++) {
    const yy = horizonY + 8 + i * (8 + i * 2);
    ctx.fillRect(G.W / 2 - 90, yy, 180, 3 + i * 0.7);
  }
  ctx.restore();

  // City silhouettes
  ctx.fillStyle = "#100020";
  const cityY = horizonY + 6;
  for (let i = 0; i < 30; i++) {
    const w = 18 + (i * 7 % 24);
    const h = 8 + ((i * 13 + G.time * 4) % 40);
    const x = ((i * 38 - (G.time * 12) % 38) + G.W) % (G.W + 60) - 30;
    ctx.fillRect(x, cityY - h, w, h);
  }
  // Window dots
  ctx.fillStyle = "rgba(0, 241, 255, 0.4)";
  for (let i = 0; i < 60; i++) {
    const x = (i * 23 - (G.time * 12) % 23 + G.W) % G.W;
    const y = horizonY + 4 + (i * 7 % 30);
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Perspective neon grid (road)
  const offset = (G.time * G.speed * 0.45) % 60;
  const vanishX = G.W / 2, vanishY = horizonY;
  ctx.strokeStyle = "rgba(255, 43, 214, 0.55)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  // Horizontal grid lines using 1/(t) projection
  for (let i = 1; i < 22; i++) {
    const t = i + (offset / 60);
    const yy = vanishY + (G.H - vanishY) * (1 - 1 / (1 + t * 0.18));
    ctx.moveTo(0, yy); ctx.lineTo(G.W, yy);
  }
  ctx.stroke();

  // Vertical road lines fanning out
  ctx.strokeStyle = "rgba(0, 241, 255, 0.5)";
  ctx.beginPath();
  for (let i = -10; i <= 10; i++) {
    const x = vanishX + i * 24;
    ctx.moveTo(vanishX, vanishY); ctx.lineTo(x * 1 + (x - vanishX) * 30, G.H + 50);
  }
  ctx.stroke();

  // Floating debris
  for (const d of Debris) {
    d.y += d.vy * 0.016 * (Player ? (1 + Player.boosting * 0.0) : 1);
    if (d.y > G.H) { d.y = -10; d.x = rand(0, G.W); }
    ctx.fillStyle = d.color; ctx.globalAlpha = 0.6;
    ctx.fillRect(d.x, d.y, d.size, d.size);
  }
  ctx.globalAlpha = 1;

  // Speed lines while boosting
  if (Player && Player.boosting) {
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 25; i++) {
      const x = (i * 137 + (G.time * 1500) % 137) % G.W;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, 18 + (i % 3) * 6);
      ctx.stroke();
    }
  }
}

// =====================================================================
// RENDERING ENTITIES
// =====================================================================
function renderPlayer() {
  if (!Player) return;
  const p = Player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // Engine flame
  const fL = p.boosting ? 28 : 16;
  const flameG = ctx.createLinearGradient(0, p.r * 0.4, 0, p.r * 0.4 + fL);
  flameG.addColorStop(0, "#ffe25a"); flameG.addColorStop(0.5, "#ff2bd6"); flameG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = flameG;
  ctx.beginPath();
  ctx.moveTo(-7, p.r * 0.4); ctx.lineTo(7, p.r * 0.4);
  ctx.lineTo(rand(-2, 2), p.r * 0.4 + fL + rand(-3, 3)); ctx.closePath();
  ctx.fill();

  // Body
  ctx.shadowBlur = 18; ctx.shadowColor = "#0ff";
  ctx.fillStyle = "#0a0420";
  ctx.strokeStyle = (p.invuln > 0 && Math.floor(p.invuln * 30) % 2) ? "#fff" : "#0ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -p.r);
  ctx.lineTo(p.r * 0.9, p.r * 0.6);
  ctx.lineTo(p.r * 0.4, p.r * 0.4);
  ctx.lineTo(-p.r * 0.4, p.r * 0.4);
  ctx.lineTo(-p.r * 0.9, p.r * 0.6);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Cockpit
  ctx.fillStyle = "#ff2bd6";
  ctx.shadowColor = "#ff2bd6";
  ctx.beginPath(); ctx.ellipse(0, -p.r * 0.3, 4, 6, 0, 0, TAU); ctx.fill();

  // Wing tip lights
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(p.r * 0.9, p.r * 0.6, 2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(-p.r * 0.9, p.r * 0.6, 2, 0, TAU); ctx.fill();

  // Shield bubble
  if (p.shield > 0) {
    ctx.shadowBlur = 16; ctx.shadowColor = "#ff2bd6";
    ctx.strokeStyle = `rgba(255,43,214,${0.4 + 0.3 * Math.sin(G.time * 8)})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, p.r + 6, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}

function renderBullets() {
  for (const b of Bullets.live) {
    ctx.save();
    ctx.shadowBlur = 14; ctx.shadowColor = b.color;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2;
    // trail
    if (b.trail.length) {
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      for (let i = b.trail.length - 1; i >= 0; i--) ctx.lineTo(b.trail[i].x, b.trail[i].y);
      ctx.stroke();
    }
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.5, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function renderEnemies() {
  for (const e of Enemies.live) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.shadowBlur = 18; ctx.shadowColor = e.color;
    const flash = e.hit > 0;
    if (e.isBoss) {
      // Boss: large angular ship
      const r = e.r;
      ctx.fillStyle = flash ? "#fff" : "#150033";
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(r * 1.2, r * 0.2);
      ctx.lineTo(r * 0.8, -r * 0.5);
      ctx.lineTo(r * 0.2, -r);
      ctx.lineTo(-r * 0.2, -r);
      ctx.lineTo(-r * 0.8, -r * 0.5);
      ctx.lineTo(-r * 1.2, r * 0.2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // core
      ctx.fillStyle = e.color;
      const pulse = 0.7 + 0.3 * Math.sin(G.time * 6);
      ctx.globalAlpha = pulse;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      // turrets
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(-r * 0.6, r * 0.3, 4, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.6, r * 0.3, 4, 0, TAU); ctx.fill();
    } else if (e.type === "drone") {
      ctx.fillStyle = flash ? "#fff" : "#160033";
      ctx.strokeStyle = e.color; ctx.lineWidth = 2;
      const r = e.r;
      ctx.beginPath();
      ctx.moveTo(0, r); ctx.lineTo(r, 0); ctx.lineTo(0, -r); ctx.lineTo(-r, 0); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = e.color;
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
    } else if (e.type === "fast") {
      ctx.fillStyle = flash ? "#fff" : "#221700";
      ctx.strokeStyle = e.color; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, e.r); ctx.lineTo(e.r * 0.7, -e.r); ctx.lineTo(-e.r * 0.7, -e.r); ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (e.type === "tank") {
      ctx.fillStyle = flash ? "#fff" : "#180038";
      ctx.strokeStyle = e.color; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(-e.r, -e.r * 0.7, e.r * 2, e.r * 1.4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = e.color;
      ctx.beginPath(); ctx.arc(0, 0, e.r * 0.4, 0, TAU); ctx.fill();
      // hp pips
      ctx.fillStyle = "#fff";
      ctx.fillRect(-e.r * 0.6, -e.r * 0.5, 4, 4);
      ctx.fillRect(e.r * 0.6 - 4, -e.r * 0.5, 4, 4);
    } else if (e.type === "kamikaze") {
      ctx.fillStyle = flash ? "#fff" : "#280008";
      ctx.strokeStyle = e.color; ctx.lineWidth = 2;
      const a = G.time * 6;
      ctx.rotate(a);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const t = (i / 5) * TAU;
        const r = i % 2 ? e.r * 0.5 : e.r;
        ctx.lineTo(Math.cos(t) * r, Math.sin(t) * r);
      }
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (e.type === "formation") {
      ctx.fillStyle = flash ? "#fff" : "#001a3b";
      ctx.strokeStyle = e.color; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -e.r); ctx.lineTo(e.r, e.r * 0.6); ctx.lineTo(-e.r, e.r * 0.6); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();

    // Boss HP bar
    if (e.isBoss) {
      const bw = G.W * 0.5, bh = 10;
      const bx = (G.W - bw) / 2, by = 24;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
      ctx.strokeStyle = "#ff2bd6"; ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
      const f = clamp(e.hp / e.maxHp, 0, 1);
      const grd = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      grd.addColorStop(0, "#ff2bd6"); grd.addColorStop(1, "#8b3bff");
      ctx.fillStyle = grd;
      ctx.fillRect(bx, by, bw * f, bh);
      ctx.fillStyle = "#fff"; ctx.font = "10px Courier New"; ctx.textAlign = "center";
      ctx.fillText("— BOSS —", G.W / 2, by - 6);
      ctx.restore();
    }
  }
}

function renderPickups() {
  for (const p of Pickups.live) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(p.t * 4) * 0.3);
    ctx.shadowBlur = 16; ctx.shadowColor = p.color;
    ctx.strokeStyle = p.color; ctx.lineWidth = 2; ctx.fillStyle = "#0a0420";
    ctx.beginPath();
    ctx.moveTo(0, -p.r); ctx.lineTo(p.r, 0); ctx.lineTo(0, p.r); ctx.lineTo(-p.r, 0); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = p.color; ctx.font = "bold 12px Courier New"; ctx.textAlign = "center";
    ctx.fillText(p.type === "energy" ? "E" : p.type === "shield" ? "S" : "+", 0, 4);
    ctx.restore();
  }
}

function renderParticles() {
  for (const p of Particles.live) {
    const a = clamp(p.life / p.maxLife, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 12 * a; ctx.shadowColor = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}

function renderFloatTexts() {
  ctx.textAlign = "center";
  for (const t of FloatTexts.live) {
    const a = clamp(t.life / t.maxLife, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = t.color;
    ctx.shadowBlur = 8; ctx.shadowColor = t.color;
    ctx.font = "bold 14px Courier New";
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}

// =====================================================================
// MINI-MAP
// =====================================================================
function renderMiniMap() {
  const w = mini.width, h = mini.height;
  mctx.clearRect(0, 0, w, h);
  mctx.fillStyle = "rgba(0,20,40,0.4)"; mctx.fillRect(0, 0, w, h);
  // grid
  mctx.strokeStyle = "rgba(0,241,255,0.25)";
  for (let i = 0; i < 4; i++) {
    mctx.beginPath();
    mctx.moveTo(0, h * i / 4); mctx.lineTo(w, h * i / 4); mctx.stroke();
  }
  // player
  mctx.fillStyle = "#0ff";
  mctx.fillRect(w / 2 - 2, h * 0.78, 4, 4);
  // enemies
  for (const e of Enemies.live) {
    const mx = e.x / G.W * w;
    const my = clamp(e.y / G.H, 0, 1) * h;
    mctx.fillStyle = e.isBoss ? "#ff2bd6" : e.color;
    const s = e.isBoss ? 5 : 2.5;
    mctx.fillRect(mx - s / 2, my - s / 2, s, s);
  }
  // pickups
  for (const p of Pickups.live) {
    mctx.fillStyle = p.color;
    mctx.fillRect(p.x / G.W * w - 1, p.y / G.H * h - 1, 2, 2);
  }
}

// =====================================================================
// OVERLAY (scanlines + chromatic + vignette)
// =====================================================================
function renderOverlay() {
  octx.clearRect(0, 0, G.W, G.H);
  // Vignette
  const vg = octx.createRadialGradient(G.W / 2, G.H / 2, G.H * 0.3, G.W / 2, G.H / 2, G.H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.55)");
  octx.fillStyle = vg; octx.fillRect(0, 0, G.W, G.H);

  // Boost distortion
  if (Player && Player.boosting) {
    octx.fillStyle = `rgba(255, 43, 214, ${0.05 + 0.03 * Math.sin(G.time * 30)})`;
    octx.fillRect(0, 0, G.W, G.H);
  }

  // Slow-mo tint
  if (G.slowmoTimer > 0) {
    octx.fillStyle = "rgba(0, 60, 120, 0.18)";
    octx.fillRect(0, 0, G.W, G.H);
  }

  // Damage flash
  if (G.flash > 0) {
    octx.globalAlpha = G.flash;
    octx.fillStyle = G.flashColor;
    octx.fillRect(0, 0, G.W, G.H);
    octx.globalAlpha = 1;
  }

  // Scanlines
  if (SETTINGS.scan) {
    octx.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 0; y < G.H; y += 3) octx.fillRect(0, y, G.W, 1);
  }
}

// =====================================================================
// HUD UPDATE
// =====================================================================
function updateHUD() {
  const setBar = (id, frac, color) => {
    const el = $(id); el.style.width = (frac * 100).toFixed(1) + "%";
    if (color) el.style.background = color;
  };
  setBar("bar-hp", clamp(Player.hp / Player.maxHp, 0, 1));
  setBar("bar-sh", clamp(Player.shield / Player.maxShield, 0, 1));
  setBar("bar-en", clamp(Player.energy / Player.maxEnergy, 0, 1));
  $("r-score").textContent = G.score.toLocaleString();
  $("r-dist").textContent  = Math.floor(G.distance) + " m";
  $("r-combo").textContent = "x" + G.combo.toFixed(1);
  $("r-fps").textContent   = G.showFps ? Math.round(G.fps) : "--";
  $("r-fps").parentElement.style.opacity = G.showFps ? 1 : 0.4;
  // weapon chips
  const wl = $("weapon-list");
  const chips = [];
  if (Player.upgrades.tripleShot) chips.push("TRI");
  else if (Player.upgrades.doubleShot) chips.push("DBL");
  if (Player.upgrades.fasterFire)  chips.push("RPM+" + Player.upgrades.fasterFire);
  if (Player.upgrades.homing)      chips.push("HOMING");
  if (Player.upgrades.pierce)      chips.push("PIERCE+" + Player.upgrades.pierce);
  if (Player.upgrades.shieldRegen) chips.push("SHLD+" + Player.upgrades.shieldRegen);
  if (Player.upgrades.moreBoost)   chips.push("BOOST+" + Player.upgrades.moreBoost);
  if (Player.upgrades.healthBoost) chips.push("HULL+" + Player.upgrades.healthBoost);
  if (Player.upgrades.emp)         chips.push("EMP " + Player.empCharges);
  if (Player.upgrades.slowmo)      chips.push("SLOW " + Player.slowmoCharges);
  wl.innerHTML = chips.map(c => `<span class="chip">${c}</span>`).join("");
}

// =====================================================================
// UPDATE LOOP — called each frame after dt computed
// =====================================================================
function updateGame(dt) {
  G.time += dt;
  G.distance += G.speed * dt * (Player.boosting ? Player.boostMult : 1) / 10;

  // Player input + movement
  const ax = Input.axis();
  const targetSpeed = Player.speed * (Player.boosting ? Player.boostMult : 1);
  Player.vx = lerp(Player.vx, ax.x * targetSpeed, 0.18);
  Player.vy = lerp(Player.vy, ax.y * targetSpeed * 0.85, 0.18);
  Player.x = clamp(Player.x + Player.vx * dt, Player.r, G.W - Player.r);
  Player.y = clamp(Player.y + Player.vy * dt, Player.r, G.H - Player.r);
  Player.targetAngle = ax.x * 0.35;
  Player.angle = lerp(Player.angle, Player.targetAngle, 0.2);

  // Boost / energy
  Player.boosting = Input.boosting() && Player.energy > 0;
  if (Player.boosting) {
    Player.energy = Math.max(0, Player.energy - 28 * dt);
    if (Math.random() < 0.7) spawnTrail(Player.x, Player.y + Player.r * 0.5, "#ffe25a");
  } else {
    Player.energy = Math.min(Player.maxEnergy, Player.energy + Player.energyRegen * dt);
  }

  // Shield regen with delay
  Player.shieldDelay = Math.max(0, Player.shieldDelay - dt);
  if (Player.shieldDelay <= 0)
    Player.shield = Math.min(Player.maxShield, Player.shield + Player.shieldRegen * dt);
  Player.invuln = Math.max(0, Player.invuln - dt);

  // Combo timer
  G.comboTimer -= dt;
  if (G.comboTimer <= 0) G.combo = Math.max(1, G.combo - dt * 0.6);

  // Firing
  Player.fireCooldown = Math.max(0, Player.fireCooldown - dt);
  if (Input.firing()) playerFire();

  // EMP / slowmo
  Player.empCooldown = Math.max(0, Player.empCooldown - dt);
  if (Input.empPressed()) triggerEMP();
  if (Input.slowPressed()) triggerSlowmo();
  if (G.slowmoTimer > 0) { G.slowmoTimer -= dt; G.slowmo = 0.45; } else { G.slowmo = 1; }

  // Spawner / bosses
  tickSpawner(dt);
  G.bossTimer += dt;
  if (G.bossTimer > 90 && !G.bossActive) { G.bossTimer = 0; spawnBoss(); }
  G.warningTimer = Math.max(0, G.warningTimer - dt);
  $("boss-warning").classList.toggle("hidden", G.warningTimer <= 0);

  // Upgrade timer
  G.upgradeTimer += dt;
  if (G.upgradeTimer >= 60) { G.upgradeTimer = 0; openUpgrade(); }

  // Update bullets
  for (const b of Bullets.live) {
    if (b.fromPlayer && b.homing) {
      // find nearest enemy
      let best = null, bd = 1e9;
      for (const e of Enemies.live) {
        const d = dist2(e.x, e.y, b.x, b.y);
        if (d < bd) { bd = d; best = e; }
      }
      if (best) {
        const dx = best.x - b.x, dy = best.y - b.y;
        const m = Math.hypot(dx, dy) || 1;
        const turn = 6 * dt;
        b.vx = lerp(b.vx, dx / m * 900, turn);
        b.vy = lerp(b.vy, dy / m * 900, turn);
      }
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.life -= dt;
    if (b.fromPlayer) {
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 6) b.trail.shift();
    }
    if (b.life <= 0 || b.x < -20 || b.x > G.W + 20 || b.y < -20 || b.y > G.H + 20) b._dead = true;
  }

  // Enemies
  for (const e of Enemies.live) {
    if (e.isBoss) bossAI(e, dt);
    else enemyAI(e, dt);
  }

  // Collisions: bullets vs enemies / player
  for (const b of Bullets.live) {
    if (b._dead) continue;
    if (b.fromPlayer) {
      for (const e of Enemies.live) {
        if (e._dead) continue;
        if (aabb(b, e)) {
          damageEnemy(e, b.dmg);
          if (b.pierce > 0) { b.pierce--; }
          else { b._dead = true; break; }
        }
      }
    } else {
      // hits player
      if (aabb(b, Player)) {
        playerDamage(b.dmg);
        b._dead = true;
        spawnBurst(b.x, b.y, 8, { color: "#ff2bd6", speed: 200, size: 2, life: 0.3 });
      } else {
        // near miss bonus
        const d2 = dist2(b.x, b.y, Player.x, Player.y);
        const nearR = Player.r + 30;
        if (d2 < nearR * nearR && Player.nearMissTimer <= 0) {
          Player.nearMissTimer = 0.35;
          addScore(50, Player.x, Player.y - 30, "NEAR MISS +50");
        }
      }
    }
  }
  Player.nearMissTimer = Math.max(0, Player.nearMissTimer - dt);

  // Enemy vs Player body collision
  for (const e of Enemies.live) {
    if (e._dead || e.isBoss && e.y < 60) continue;
    if (aabb(e, Player)) {
      const dmg = e.type === "kamikaze" ? 30 : e.isBoss ? 25 : 12;
      playerDamage(dmg);
      damageEnemy(e, e.isBoss ? 4 : 99);
    }
  }

  // Pickups
  updatePickups(dt);

  // Particles
  for (const p of Particles.live) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= p.drag; p.vy *= p.drag;
    p.life -= dt;
    if (p.life <= 0) p._dead = true;
  }
  Particles.sweep();
  Bullets.sweep();
  for (let i = Enemies.live.length - 1; i >= 0; i--) if (Enemies.live[i]._dead) Enemies.live.splice(i, 1);
  // float texts
  for (const t of FloatTexts.live) { t.y += t.vy * dt; t.life -= dt; if (t.life <= 0) t._dead = true; }
  FloatTexts.sweep();

  // Effects
  G.flash = Math.max(0, G.flash - dt * 1.6);
  G.shake = Math.max(0, G.shake - dt * 50);
}

// =====================================================================
// RENDER ROOT
// =====================================================================
function render() {
  // shake offset
  let sx = 0, sy = 0;
  if (SETTINGS.shake && G.shake > 0) {
    sx = rand(-G.shake, G.shake) * 0.5; sy = rand(-G.shake, G.shake) * 0.5;
  }
  ctx.setTransform(G.dpr, 0, 0, G.dpr, sx * G.dpr, sy * G.dpr);

  renderBackground();
  renderPickups();
  renderEnemies();
  renderBullets();
  renderParticles();
  renderPlayer();
  renderFloatTexts();

  ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  renderMiniMap();
  renderOverlay();
}

// =====================================================================
// GAME LIFECYCLE
// =====================================================================
function startGame() {
  Particles.clear(); Bullets.clear(); FloatTexts.clear();
  Enemies.live.length = 0; Pickups.live.length = 0;
  Player = createPlayer();
  Object.assign(G, {
    state: "playing", time: 0, distance: 0, score: 0, combo: 1, comboTimer: 0,
    upgradeTimer: 0, bossTimer: 0, bossActive: null, warningTimer: 0,
    spawnTimer: 0, difficulty: 1, shake: 0, flash: 0, slowmoTimer: 0, slowmo: 1
  });
  Audio.ensure(); Audio.startMusic();
  $("hud").classList.remove("hidden");
  hideAllScreens();
}

function gameOver() {
  if (G.state === "gameover") return;
  G.state = "gameover";
  spawnBurst(Player.x, Player.y, 60, { color: "#ffe25a", speed: 600, size: 4, life: 1 });
  spawnBurst(Player.x, Player.y, 40, { color: "#ff2bd6", speed: 800, size: 3, life: 1.2 });
  Audio.bigBoom();
  G.shake = 36; G.flash = 0.7; G.flashColor = "#fff";
  if (G.score > G.hi) { G.hi = G.score; localStorage.setItem("nd_high", G.hi); $("go-new").classList.remove("hidden"); }
  else $("go-new").classList.add("hidden");
  $("go-score").textContent = G.score.toLocaleString();
  $("go-dist").textContent  = Math.floor(G.distance) + " m";
  $("go-hi").textContent    = G.hi.toLocaleString();
  setTimeout(() => { $("hud").classList.add("hidden"); $("gameover").classList.remove("hidden"); }, 900);
}

function openUpgrade() {
  G.state = "upgrade";
  const cards = rollUpgrades();
  const wrap = $("upgrade-cards");
  wrap.innerHTML = "";
  cards.forEach(u => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `<div class="icon">${u.icon}</div><div class="title">${u.title}</div><div class="desc">${u.desc}</div>`;
    el.addEventListener("click", () => {
      applyUpgrade(u);
      $("upgrade").classList.add("hidden");
      G.state = "playing";
    });
    wrap.appendChild(el);
  });
  if (cards.length === 0) { G.state = "playing"; return; } // nothing left
  $("upgrade").classList.remove("hidden");
}

// =====================================================================
// UI CONTROLLER
// =====================================================================
const UI = {
  showScreen(id) {
    hideAllScreens();
    $(id).classList.remove("hidden");
  },
  togglePause() {
    if (G.state === "playing") {
      G.state = "paused";
      $("pause").classList.remove("hidden");
    } else if (G.state === "paused") {
      G.state = "playing";
      $("pause").classList.add("hidden");
    }
  },
  refreshSettings() {
    $("vol-master").value = SETTINGS.master;
    $("vol-music").value  = SETTINGS.music;
    $("vol-sfx").value    = SETTINGS.sfx;
    $("opt-mute").checked = SETTINGS.mute;
    $("opt-shake").checked = SETTINGS.shake;
    $("opt-scan").checked = SETTINGS.scan;
  }
};

function hideAllScreens() {
  for (const id of ["menu", "controls", "settings", "pause", "gameover", "upgrade"])
    $(id).classList.add("hidden");
}

// =====================================================================
// RESIZE
// =====================================================================
function resize() {
  G.dpr = Math.min(window.devicePixelRatio || 1, 2);
  G.W = window.innerWidth;
  G.H = window.innerHeight;
  for (const c of [cv, ov]) {
    c.width = G.W * G.dpr;
    c.height = G.H * G.dpr;
    c.style.width = G.W + "px";
    c.style.height = G.H + "px";
  }
  ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  octx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  initDebris();
  // Show touch UI on touch devices
  if ("ontouchstart" in window) $("touch").classList.add("show");
}

// =====================================================================
// MAIN LOOP
// =====================================================================
function frame(now) {
  const dtRaw = Math.min(0.05, (now - G.prev) / 1000 || 0);
  G.prev = now;

  // FPS averaging
  G.fpsAcc += dtRaw; G.fpsCount++;
  if (G.fpsAcc > 0.5) { G.fps = G.fpsCount / G.fpsAcc; G.fpsAcc = 0; G.fpsCount = 0; }

  // Hitstop pauses simulation but keeps render
  if (G.hitstop > 0) { G.hitstop -= dtRaw; }
  else if (G.state === "playing") {
    const dt = dtRaw * G.slowmo;
    updateGame(dt);
    updateHUD();
    tickAchievements(dtRaw);
  } else if (G.state === "upgrade" || G.state === "paused") {
    // freeze sim, animate UI
    tickAchievements(dtRaw);
    updateHUD();
  }

  render();
  requestAnimationFrame(frame);
}

// =====================================================================
// EVENT WIRING
// =====================================================================
function wireUI() {
  document.body.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    Audio.ensure(); Audio.ui();
    const a = t.dataset.act;
    if (a === "start")     startGame();
    else if (a === "controls") UI.showScreen("controls");
    else if (a === "settings") UI.showScreen("settings");
    else if (a === "back")     UI.showScreen(G.state === "paused" ? "pause" : "menu");
    else if (a === "resume")   UI.togglePause();
    else if (a === "quit") {
      G.state = "menu";
      $("hud").classList.add("hidden");
      UI.showScreen("menu");
      $("hi-score").textContent = G.hi.toLocaleString();
    }
    else if (a === "restart") startGame();
    else if (a === "fullscreen") {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
    }
  });
  // Quick buttons
  $("qb-pause").addEventListener("click", () => UI.togglePause());
  $("qb-mute").addEventListener("click", () => {
    SETTINGS.mute = !SETTINGS.mute; saveSettings(); Audio.setVol(); UI.refreshSettings();
  });

  // Settings inputs
  const bind = (id, key) => $(id).addEventListener("input", (e) => {
    SETTINGS[key] = +e.target.value; saveSettings(); Audio.setVol();
  });
  bind("vol-master", "master"); bind("vol-music", "music"); bind("vol-sfx", "sfx");
  $("opt-mute").addEventListener("change", (e) => { SETTINGS.mute = e.target.checked; saveSettings(); Audio.setVol(); });
  $("opt-shake").addEventListener("change", (e) => { SETTINGS.shake = e.target.checked; saveSettings(); });
  $("opt-scan").addEventListener("change", (e) => { SETTINGS.scan = e.target.checked; saveSettings(); });
}

// =====================================================================
// BOOT
// =====================================================================
function init() {
  resize();
  window.addEventListener("resize", resize);
  Input.init();
  wireUI();
  UI.refreshSettings();
  $("hi-score").textContent = G.hi.toLocaleString();
  G.prev = performance.now();
  requestAnimationFrame(frame);
}
init();
