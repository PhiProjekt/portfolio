// ==========================================
// --- CORE PORTFOLIO LOGIC (STABILISIERT & KORRIGIERT) ---
// ==========================================
const Lrc = {
    Lrc: class {
        constructor(lrcString) {
            this.lyrics = this.parseLrc(lrcString);
            this.currentTime = 0;
            this.isPlaying = false;
            this.lastUpdateTime = 0;
            this.container = null;
            this.events = { play: [], pause: [] };
            this.animationFrameId = null;
        }

        parseLrc(lrcString) {
            const lines = lrcString.split('\n');
            const lyrics = [];
            const timeReg = /\[(\d{2,}):(\d{2,}(?:\.\d{1,3})?)\]/;
            for (const line of lines) {
                const match = timeReg.exec(line);
                if (match) {
                    // KORRIGIERT: parseInt muss auf die erste Capturing Group zugreifen (match[1])
                    const minutes = parseInt(match[1], 10);
                    const seconds = parseFloat(match[2]);
                    const time = minutes * 60 + seconds;
                    const text = line.replace(timeReg, '').trim();
                    if (text) {
                        lyrics.push({ time, text });
                    }
                }
            }
            return lyrics.sort((a, b) => a.time - b.time);
        }

        render(container) {
            this.container = container;
            this.container.innerHTML = '';
            const scrollInner = document.createElement('div');
            scrollInner.className = 'lyrics-scroll-inner';
            scrollInner.style.transform = 'translateY(40px)';
            this.lyrics.forEach((item, index) => {
                const lineEl = document.createElement('div');
                lineEl.className = 'lyrics-line';
                lineEl.innerText = item.text;
                lineEl.id = `lyric-line-${index}`;
                scrollInner.appendChild(lineEl);
            });
            this.container.appendChild(scrollInner);
        }

        on(event, callback) {
            if (this.events[event]) {
                this.events[event].push(callback);
            }
        }

        trigger(event) {
            if (this.events[event]) {
                this.events[event].forEach(cb => cb());
            }
        }

        play() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            this.lastUpdateTime = performance.now();
            this.trigger('play');
            this.tick();
        }

        pause() {
            if (!this.isPlaying) return;
            this.isPlaying = false;
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            this.trigger('pause');
        }

        toggle() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        }

        tick() {
            if (!this.isPlaying) return;
            const now = performance.now();
            const delta = (now - this.lastUpdateTime) / 1000;
            this.lastUpdateTime = now;
            this.currentTime += delta;
            this.updateActiveLyric();
            this.animationFrameId = requestAnimationFrame(() => this.tick());
        }

        updateActiveLyric() {
            let activeIndex = -1;
            for (let i = 0; i < this.lyrics.length; i++) {
                if (this.currentTime >= this.lyrics[i].time) {
                    activeIndex = i;
                } else {
                    break;
                }
            }
            if (activeIndex !== -1) {
                const scrollInner = this.container.querySelector('.lyrics-scroll-inner');
                const lines = this.container.querySelectorAll('.lyrics-line');
                lines.forEach((line, idx) => {
                    if (idx === activeIndex) {
                        if (!line.classList.contains('is-active')) {
                            line.classList.add('is-active');
                            const lineOffsetTop = line.offsetTop;
                            const containerHeight = this.container.clientHeight;
                            const lineHeight = line.clientHeight;
                            const scrollY = -(lineOffsetTop - containerHeight / 2 + lineHeight / 2);
                            if (scrollInner) {
                                scrollInner.style.transform = `translateY(${scrollY}px)`;
                            }
                        }
                    } else {
                        line.classList.remove('is-active');
                    }
                });
            }
        }
    }
};

// KORRIGIERT: Sichere AOS-Initialisierung, um mögliche Fehler abzufangen
if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 1200, once: true });
}

const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-item');

const themeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const theme = entry.target.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            navItems.forEach((item) => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${entry.target.id}`) {
                    item.classList.add('active');
                }
            });
            morphParticleColors(theme);
        }
    });
}, { root: null, threshold: 0.20 });

sections.forEach((section) => themeObserver.observe(section));

const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('mobileSidebar');
const closeBtn = document.getElementById('closeBtn');
const sidebarLinks = document.querySelectorAll('.sidebar.mobile a');

if (hamburger && sidebar) hamburger.onclick = () => sidebar.classList.add('open');
if (closeBtn && sidebar) closeBtn.onclick = () => sidebar.classList.remove('open');
sidebarLinks.forEach(link => {
    link.onclick = () => sidebar.classList.remove('open');
});

// Allgemeine Aufklapp-Funktion für Sektionen (Workout & Hobbies)
function toggleCollapsible(id) {
    const content = document.getElementById(id);
    const icon = document.getElementById(id + '-icon');
    if (content && icon) {
        content.classList.toggle('open');
        icon.classList.toggle('rotated');
    }
}

// Aufklapp-Funktion für Künstler im Musik-Player
function toggleArtistDropdown(id) {
    const content = document.getElementById(id);
    const arrow = document.getElementById(id + '-arrow');
    if (content && arrow) {
        content.classList.toggle('open');
        arrow.classList.toggle('rotated');
    }
}

// Sport-Popup-Inhalte mit deinen exakten Daten
function openPopup(sport, typeClass) {
    const popup = document.getElementById('custom-popup');
    const headerImg = document.getElementById('popup-theme-header');
    const title = document.getElementById('popup-title');
    const content = document.getElementById('popup-content-area');
    headerImg.className = 'popup-header-img ' + typeClass;
    title.innerText = sport;

    if (sport === 'Eishockey') {
        content.innerHTML = `
            <p style="margin-bottom: 1rem; line-height: 1.5;"><strong>❄️ Eishockey — Leidenschaft auf dem Eis</strong></p>
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem;">
                <p>📍 <strong>Position:</strong> 2010 - 2014 Torwart | 2014 - 2016 Verteidiger</p>
                <p>🏆 <strong>Erfolge:</strong> Vizemeister Bezirksmeisterschaft Oberbayern 2016 (Slalom & Schnelllauf) | "2nd best Goalie in Camp"</p>
                <p>🏒 <strong>Vereine:</strong> SC Riessersee (SCR) | Augsburger Panther (AEV)</p>
                <p>⚡ <strong>Key-Skills:</strong> Spielübersicht, Spielaufbau, Point-to-Point, Point-Shot</p>
            </div>`;
    } else if (sport === 'Thaiboxen') {
        content.innerHTML = `
            <p style="margin-bottom: 1rem; line-height: 1.5;"><strong>🥊 Thaiboxen (Muay Thai) — Kunst der 8 Gliedmaßen</strong></p>
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem;">
                <p>🏆 <strong>Erfolge:</strong> Beitritt Wettkampf-Team (07.2026)</p>
                <p>🥋 <strong>Team/Schule:</strong> Garabu / Fight Academy Allgäu</p>
                <p>📍 <strong>Schwerpunkte:</strong> Pratzentraining, Sparring, Ausdauer</p>
                <p>🙏 <strong>Wichtige Werte:</strong> Respekt, Kontrolle, Durchhaltevermögen, Achtsamkeit</p>
            </div>`;
    }
    popup.classList.add('active');
}

function closePopup() {
    document.getElementById('custom-popup').classList.remove('active');
}

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('custom-popup')) closePopup();
});

// Interaktive Trainingsplan-Daten
const workoutData = {
    hockey: [
        { task: "Springseil (30 Minuten)", done: false },
        { task: "50 Kniebeugen", done: false },
        { task: "20 Split Squats pro Seite", done: false },
        { task: "15 Squat Jumps", done: false },
        { task: "15 Lunges pro Seite", done: false },
        { task: "50 Calf raises", done: false },
        { task: "Wall sit (bis zum Muskelversagen)", done: false }
    ],
    boxing: [
        { task: "Springseil (30 Minuten)", done: false },
        { task: "Vorbereitung (Ellbogen auf Schulterhöhe, Unterarme gerade nach oben gerichtet und Ellbogen so nah aneinander wie möglich)", done: false },
        { task: "Schnelle Auslagenwechsel auf der Stelle (2 Min.)", done: false },
        { task: "Jumping Jacks mit genannter Armposition (2 Min.)", done: false },
        { task: "Abwechselnd Auslagenwechsel & Jumping Jacks (2 Min.)", done: false },
        { task: "Technik-Intervall (Abwechselnd ausführen):", done: false },
        { task: "→ Gerade schlagen (2 Min.)", done: false },
        { task: "→ Haken schlagen (2 Min.)", done: false },
        { task: "→ Aufwärtshaken schlagen (2 Min.)", done: false },
        { task: "→ Thai-Block zu Low-Kick", done: false }
    ]
};

function generateWorkout(type) {
    const btns = document.querySelectorAll('.workout-btn');
    const targetBtn = Array.from(btns).find(btn => btn.getAttribute('onclick').includes(`'${type}'`));
    if (targetBtn) {
        btns.forEach(btn => btn.classList.remove('active'));
        targetBtn.classList.add('active');
    }
    const output = document.getElementById('workout-output');
    output.innerHTML = workoutData[type].map((t, idx) => `
        <div class="workout-item ${t.done ? 'completed' : ''}">
            <input type="checkbox" class="workout-checkbox" id="task-${idx}" ${t.done ? 'checked' : ''} onchange="toggleTask('${type}', ${idx})">
            <label for="task-${idx}">${t.task}</label>
        </div>`).join('');
}

function toggleTask(type, idx) {
    workoutData[type][idx].done = !workoutData[type][idx].done;
    generateWorkout(type);
}

document.addEventListener("DOMContentLoaded", () => generateWorkout('boxing'));

// Musik-Katalog mit alphabetischer Sortierung
const musicCatalog = {
    edm: [
        {
            artist: "Brutalismus 3000",
            tracks: [
                { id: "berlin", title: "DIE LIEBE KOMMT NICHT AUS BERLIN" },
                { id: "europatraeume", title: "EUROPATRÄUME" },
                { id: "romantika", title: "ROMANTIKA" },
                { id: "je-nexiste-pas", title: "JE N'EXISTE PAS" }
            ]
        },
        {
            artist: "Kalte Liebe",
            tracks: [
                { id: "vergiftete-jugend", title: "Vergiftete Jugend" },
                { id: "rosen-sind-rot", title: "Rosen sind Rot" }
            ]
        }
    ],
    rap: [
        {
            artist: "Sido",
            tracks: [
                { id: "bilder-im-kopf", title: "Bilder im Kopf" }
            ]
        }
    ],
    rock: [
        {
            artist: "Limp Bizkit",
            tracks: [
                { id: "nookie", title: "Nookie" }
            ]
        }
    ],
    retro: [
        {
            artist: "Alphaville",
            tracks: [
                { id: "forever-young", title: "Forever Young" }
            ]
        }
    ]
};

let lrcPlayer = null;
const playPauseBtn = document.getElementById('play-pause-btn');
const lyricsContainer = document.getElementById('lyrics-container');

async function loadSong(songId) {
    if (lrcPlayer) {
        lrcPlayer.pause();
        lrcPlayer = null;
    }
    updatePlayerUI(false);
    lyricsContainer.innerHTML = `<div class="lyrics-line placeholder">Lade Song...</div>`;
    playPauseBtn.disabled = true;
    try {
        const response = await fetch(`lrc/${songId}.lrc`);
        if (!response.ok) throw new Error(`LRC-Datei für '${songId}' nicht gefunden.`);
        const lrcString = await response.text();
        lrcPlayer = new Lrc.Lrc(lrcString);
        lrcPlayer.render(lyricsContainer);
        lrcPlayer.on('play', () => updatePlayerUI(true));
        lrcPlayer.on('pause', () => updatePlayerUI(false));
        playPauseBtn.disabled = false;
    } catch (error) {
        console.error("Fehler beim Laden des Songs:", error);
        lyricsContainer.innerHTML = `<div class="lyrics-line placeholder" style="color: #ff4d6d;">${error.message}</div>`;
    }
}

playPauseBtn.addEventListener('click', () => {
    if (lrcPlayer) {
        lrcPlayer.toggle();
    } else {
        alert("Bitte wähle zuerst einen Song aus der Liste!");
    }
});

function updatePlayerUI(isPlaying) {
    const reelL = document.getElementById('reel-l');
    const reelR = document.getElementById('reel-r');
    const eqBars = document.querySelectorAll('.eq-bar');
    if (isPlaying) {
        playPauseBtn.innerText = "⏸ PAUSE";
        reelL.classList.add('spinning');
        reelR.classList.add('spinning');
        eqBars.forEach(bar => bar.classList.add('active'));
    } else {
        playPauseBtn.innerText = "▶ PLAY";
        reelL.classList.remove('spinning');
        reelR.classList.remove('spinning');
        eqBars.forEach(bar => bar.classList.remove('active'));
    }
}

// Dashboard-Generierung sortiert Künstler & Songs vollautomatisch alphabetisch
function initMusicDashboard() {
    const genreKeys = Object.keys(musicCatalog);
    const genreSelector = document.getElementById('genre-selector-container');
    const genreDisplay = document.getElementById('genre-display-content');

    function getGenreName(key) {
        const names = { edm: '⚡ EDM / Techno', rap: '🎤 Rap', rock: '🎸 Metal & Rock', retro: '📼 Retro Pop' };
        return names[key] || key;
    }

    genreSelector.innerHTML = genreKeys.map(key => `<button class="genre-btn" data-genre="${key}">${getGenreName(key)}</button>`).join('');

    genreSelector.addEventListener('click', (e) => {
        if (e.target.matches('.genre-btn')) switchGenre(e.target.dataset.genre);
    });

    function switchGenre(genreKey) {
        document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.genre === genreKey));

        // 1. Sortiere die Künstler alphabetisch
        const sortedArtists = [...musicCatalog[genreKey]].sort((a, b) => a.artist.localeCompare(b.artist));

        genreDisplay.innerHTML = sortedArtists.map((artistObj, artistIdx) => {
            const dropdownId = `artist-drop-${genreKey}-${artistIdx}`;

            // 2. Sortiere die Songs des Künstlers alphabetisch
            const sortedTracks = [...artistObj.tracks].sort((a, b) => a.title.localeCompare(b.title));

            return `
                <div class="artist-dropdown">
                    <div class="artist-header" onclick="toggleArtistDropdown('${dropdownId}')">
                        <span>👤 ${artistObj.artist}</span>
                        <span class="toggle-icon" id="${dropdownId}-arrow">▼</span>
                    </div>
                    <div id="${dropdownId}" class="artist-tracks">
                        ${sortedTracks.map(song => `
                            <div class="track-item" onclick="loadSong('${song.id}')">
                                <div><strong>${song.title}</strong></div>
                                <span style="font-size:0.8rem; color:var(--accent-color);">🎤</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    if (genreKeys.length > 0) switchGenre(genreKeys[0]);
}

document.addEventListener("DOMContentLoaded", initMusicDashboard);

const feedCounters = { panda: 0, katze: 0, panther: 0, axolotl: 0, gorilla: 0 };
const API_URL = 'https://example.com/api/feed-counts';

async function loadInitialCounts() {
    try {
        const counts = { panda: 120, katze: 88, panther: 42, axolotl: 77, gorilla: 55 };
        Object.keys(counts).forEach(animalId => {
            feedCounters[animalId] = counts[animalId];
            const el = document.getElementById(`feed-${animalId}`);
            if (el) el.innerText = counts[animalId];
        });
    } catch (error) {
        console.error("Konnte Fütterungs-Zähler nicht laden:", error);
    }
}

async function incrementFeedCount(animalId) {
    try {
        feedCounters[animalId]++;
        document.getElementById(`feed-${animalId}`).innerText = feedCounters[animalId];
    } catch (error) {
        console.error(`Fehler beim Inkrementieren für ${animalId}:`, error);
    }
}

function feedAnimal(animalId, emoji, element) {
    incrementFeedCount(animalId);
    const particle = document.createElement('div');
    particle.className = 'particle-emoji';
    particle.innerText = emoji === '🐼' ? '🎋' : (emoji === '🐈' ? '🐟' : (emoji === '🐈‍⬛' ? '🍖' : (emoji === '🦎' ? '🦐' : '🍌')));
    particle.style.left = `${Math.random() * 60 + 20}%`;
    particle.style.top = `30%`;
    element.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
}

document.addEventListener("DOMContentLoaded", loadInitialCounts);

// Filmliste exakt an deine Lieblingsfilme mit berühmten Zitaten angepasst
const movies = [
    { title: "Pulp Fiction", quote: "\"Any time of the day is a good time for pie.\"" },
    { title: "The Big Lebowski", quote: "\"The Dude abides.\"" },
    { title: "Fight Club", quote: "\"The first rule of Fight Club is...\"" },
    { title: "Gladiator", quote: "\"What we do in life echoes in eternity.\"" },
    { title: "Wall-E", quote: "\"Eee-va?\"" },
    { title: "Django Unchained", quote: "\"I like the way you die, boy.\"" }
];

function spinMovieWheel() {
    const ticket = document.getElementById('movie-ticket');
    ticket.classList.remove('dispensing');
    void ticket.offsetWidth;
    ticket.classList.add('dispensing');
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    setTimeout(() => {
        document.getElementById('ticket-title').innerText = randomMovie.title.toUpperCase();
        document.getElementById('ticket-quote').innerText = randomMovie.quote;
    }, 200);
}

function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('portfolio-contact-form').classList.add('hidden');
    document.getElementById('contact-success-state').classList.remove('hidden');
}

function resetContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    const success = document.getElementById('contact-success-state');
    form.reset();
    form.classList.remove('hidden');
    success.classList.add('hidden');
}

const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.targetColor = { r: 255, g: 255, b: 255 };
        this.currentColor = { r: 255, g: 255, b: 255 };
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.alpha = Math.random() * 0.6 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.currentColor.r += (this.targetColor.r - this.currentColor.r) * 0.05;
        this.currentColor.g += (this.targetColor.g - this.currentColor.g) * 0.05;
        this.currentColor.b += (this.targetColor.b - this.currentColor.b) * 0.05;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }
    draw() {
        const r = Math.round(this.currentColor.r);
        const g = Math.round(this.currentColor.g);
        const b = Math.round(this.currentColor.b);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function setupParticles() {
    particles = Array.from({ length: 80 }, () => new Particle());
}

function morphParticleColors(theme) {
    let nextColor;
    if (theme === 'sport') nextColor = { r: 0, g: 240, b: 255 };
    else if (theme === 'musik') nextColor = { r: 236, g: 0, b: 140 };
    else if (theme === 'tiere') nextColor = { r: 0, g: 255, b: 135 };
    else if (theme === 'filme') nextColor = { r: 255, g: 183, b: 3 };
    else nextColor = { r: 255, g: 255, b: 255 };
    particles.forEach(p => p.targetColor = nextColor);
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initCanvas();
        setupParticles();
    }, 100);
});

initCanvas();
setupParticles();
animateParticles();

// =========================================================================
// --- DEVELOPER MINI GAME: BUG SMASHER v5.2 (STABILISIERT) ---
// =========================================================================
class Player {
    constructor(game) {
        this.game = game;
        this.width = 40; this.height = 20;
        this.x = game.width / 2 - this.width / 2;
        this.y = game.height - this.height - 20;
        this.speed = 5; this.dx = 0;
        this.element = document.getElementById('player-ship');
    }
    update() {
        if (this.game.keys['arrowleft'] || this.game.keys['a'] || this.game.joystick.direction < 0) this.dx = -1;
        else if (this.game.keys['arrowright'] || this.game.keys['d'] || this.game.joystick.direction > 0) this.dx = 1;
        else this.dx = 0;
        this.x += this.dx * this.speed;
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
    }
    draw() { this.element.style.transform = `translate3d(${this.x}px, 0, 0)`; }
}

class Bullet {
    constructor(game) {
        this.game = game;
        this.width = 30; this.height = 15;
        this.x = game.player.x + game.player.width / 2 - this.width / 2;
        this.y = game.player.y - this.height;
        this.speed = 7; this.markedForDeletion = false;
        this.element = document.createElement('div');
        this.element.className = 'bullet';
        this.element.innerText = Math.random() > 0.5 ? 'fix' : 'let';
        this.element.style.position = 'absolute';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        game.container.appendChild(this.element);
    }
    update() {
        this.y -= this.speed;
        if (this.y < 0 - this.height) this.markedForDeletion = true;
    }
    draw() { this.element.style.transform = `translate3d(0, ${this.y - (this.game.player.y - this.height)}px, 0)`; }
}

class Bug {
    constructor(game) {
        this.game = game; this.speed = 2; this.markedForDeletion = false;
        this.element = document.createElement('div');
        this.element.className = 'bug-invader';
        this.element.innerText = '👾 ' + ['SyntaxError', '404', 'NullRef', 'Loop', 'MergeConflict'][Math.floor(Math.random() * 5)];
        this.element.style.position = 'absolute';
        this.element.style.visibility = 'hidden';
        game.container.appendChild(this.element);
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        this.element.style.visibility = 'visible';
        this.x = Math.random() * (game.width - this.width);
        this.y = -this.height;
    }
    update() {
        this.y += this.speed;
        if (this.y > this.game.height) { this.markedForDeletion = true; this.game.gameOver(); }
    }
    draw() { this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`; }
}

class Game {
    constructor(width, height) {
        this.width = width; this.height = height;
        this.container = document.getElementById('game-container');
        this.startScreen = document.getElementById('game-start-screen');
        this.scoreElement = document.getElementById('game-score');
        this.bugsElement = document.getElementById('game-bugs');
        this.player = new Player(this);
        this.keys = {}; this.joystick = { direction: 0 };
        this.bullets = []; this.bugs = [];
        this.bugSpawner = null; this.shootInterval = null; this.isShooting = false;
        this.score = 0; this.bugsSmashed = 0;
        this.gameLoopAnimationId = null;
        this.setupInputHandlers();
    }
    start() {
        this.active = true; this.score = 0; this.bugsSmashed = 0; this.bullets = []; this.bugs = [];
        const oldElements = this.container.querySelectorAll('.bug-invader, .bullet, .explosion');
        oldElements.forEach(el => el.remove());
        this.startScreen.classList.add('hidden');
        this.player.element.classList.remove('hidden');
        this.scoreElement.innerText = '0'; this.bugsElement.innerText = '0';
        this.player = new Player(this);
        this.bugSpawner = setInterval(() => this.addBug(), 1400);
        if (this.gameLoopAnimationId) cancelAnimationFrame(this.gameLoopAnimationId);
        this.animate();
    }
    gameOver() {
        if (!this.active) return; this.active = false;
        clearInterval(this.bugSpawner); clearInterval(this.shootInterval);
        this.shootInterval = null; cancelAnimationFrame(this.gameLoopAnimationId);
        const endScreen = `
            <h3 style="color: #ff4d6d;">💥 TERMINAL CRASHED!</h3>
            <p>Ein Bug ist durchgeschlüpft.<br><strong>Score: ${this.score} | Bugs: ${this.bugsSmashed}</strong></p>
            <button class="btn-main" onclick="window.gameInstance.start()">Erneut versuchen</button>`;
        this.startScreen.innerHTML = endScreen;
        this.player.element.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
    }
    addBug() { this.bugs.push(new Bug(this)); }
    fireBullet() { if (this.active) this.bullets.push(new Bullet(this)); }
    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.bugs.length - 1; j >= 0; j--) {
                const bug = this.bugs[j];
                if (bullet.x < bug.x + bug.width && bullet.x + bullet.width > bug.x &&
                    bullet.y < bug.y + bug.height && bullet.y + bullet.height > bug.y) {
                    this.createExplosion(bug.x, bug.y);
                    bug.markedForDeletion = true; bullet.markedForDeletion = true;
                    this.score += 10; this.bugsSmashed++;
                }
            }
        }
    }
    createExplosion(x, y) {
        const exp = document.createElement('div');
        exp.className = 'explosion';
        exp.innerText = '✨'; exp.style.position = 'absolute';
        exp.style.left = x + 'px'; exp.style.top = y + 'px';
        exp.style.fontSize = '1.5rem'; this.container.appendChild(exp);
        setTimeout(() => exp.remove(), 400);
    }
    animate() {
        if (!this.active) return;
        this.player.update();
        [...this.bullets, ...this.bugs].forEach(e => e.update());
        this.checkCollisions();
        this.bullets = this.bullets.filter(b => !b.markedForDeletion);
        this.bugs = this.bugs.filter(b => !b.markedForDeletion);
        this.container.querySelectorAll('.bullet, .bug-invader').forEach(el => {
            const collection = el.classList.contains('bullet') ? this.bullets : this.bugs;
            if (!collection.some(entity => entity.element === el)) el.remove();
        });
        this.player.draw();
        [...this.bullets, ...this.bugs].forEach(e => e.draw());
        this.scoreElement.innerText = this.score; this.bugsElement.innerText = this.bugsSmashed;
        this.gameLoopAnimationId = requestAnimationFrame(this.animate.bind(this));
    }
    setupInputHandlers() {
        window.addEventListener('keydown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const key = e.key.toLowerCase(); this.keys[key] = true;
            if (key === ' ' || key === 'spacebar') {
                e.preventDefault();
                if (!this.isShooting && this.active) {
                    this.isShooting = true; this.fireBullet();
                    this.shootInterval = setInterval(() => this.fireBullet(), 220);
                }
            }
        });
        window.addEventListener('keyup', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const key = e.key.toLowerCase(); this.keys[key] = false;
            if (key === ' ' || key === 'spacebar') {
                this.isShooting = false; clearInterval(this.shootInterval);
            }
        });
        const shootBtn = document.getElementById('touch-shoot');
        shootBtn.addEventListener('touchstart', e => {
            if (!this.active) return; e.preventDefault();
            this.isShooting = true; this.fireBullet();
            this.shootInterval = setInterval(() => this.fireBullet(), 220);
        }, { passive: false });
        shootBtn.addEventListener('touchend', e => {
            e.preventDefault(); this.isShooting = false; clearInterval(this.shootInterval);
        });
        
        // KORRIGIERT: Abgesicherte NippleJS-Initialisierung gegen unerwartete Touch-Fehler
        if ('ontouchstart' in window && window.innerWidth <= 768) {
            const joystickZone = document.getElementById('joystick-zone');
            if (joystickZone && typeof nipplejs !== 'undefined') {
                try {
                    const manager = nipplejs.create({
                        zone: joystickZone,
                        mode: 'static',
                        position: { left: '50%', top: '50%' },
                        color: 'var(--accent-color)',
                        size: 100,
                    });
                    manager.on('move', (evt, data) => {
                        if (data && data.direction) this.joystick.direction = (data.direction.x === 'left') ? -1 : 1;
                    }).on('end', () => this.joystick.direction = 0);
                } catch (err) {
                    console.warn("NippleJS-Initialisierung übersprungen:", err.message);
                }
            }
        }
    }
}

// KORRIGIERT: startGame muss global verfügbar sein, daher keine DOMContentLoaded-Kapselung hier
function startGame() {
    if (!window.gameInstance) {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            window.gameInstance = new Game(gameContainer.clientWidth, gameContainer.clientHeight);
        }
    }
    if (window.gameInstance) {
        window.gameInstance.start();
    }
}

// Initialisierung des Spiels beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    if (!window.gameInstance) {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            window.gameInstance = new Game(gameContainer.clientWidth, gameContainer.clientHeight);
        }
    }
});
