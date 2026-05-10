// ===== ТЕМА =====
const themeToggleButton = document.getElementById('theme-toggle');
const root = document.documentElement;
const THEME_KEY = 'theme';

const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    if (themeToggleButton) {
        const iconSpan = themeToggleButton.querySelector('.theme-toggle-icon');
        if (iconSpan) iconSpan.textContent = '☀️';
    }
} else {
    root.setAttribute('data-theme', 'light');
}

if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

        root.setAttribute('data-theme', nextTheme);
        localStorage.setItem(THEME_KEY, nextTheme);

        const iconSpan = themeToggleButton.querySelector('.theme-toggle-icon');
        if (iconSpan) {
            iconSpan.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
        }
    });
}

// ===== ЧАСТИЦЫ С ЛИНИЯМИ (SPEED = 5.4) =====

const canvas = document.getElementById('bg-particles');
if (canvas) {
    const ctx = canvas.getContext('2d');

    let particles = [];
    const PARTICLE_COUNT = 106;       // можно регулировать под FPS
    const MAX_DISTANCE = 170;
    const SPEED = 2.6;              // более спокойная скорость

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function createParticles() {
        particles = [];
        const w = canvas.width;
        const h = canvas.height;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const size = Math.random() < 0.5 ? 2 : 3;

            // нормализованное направление + лёгкий разброс по модулю скорости
            const angle = Math.random() * Math.PI * 2;
            const speedFactor = 0.6 + Math.random() * 0.4; // 0.6–1.0 от SPEED
            const vx = Math.cos(angle) * SPEED * speedFactor;
            const vy = Math.sin(angle) * SPEED * speedFactor;

            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx,
                vy,
                size,
                type: Math.random() < 0.5 ? 0 : 1, // 0 = круг, 1 = квадрат
            });
        }
    }

    function draw() {
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        const isDark = root.getAttribute('data-theme') !== 'light';

// Цвет точек и линий по теме:
// - в тёмной теме — светлые частицы и чуть синеватые линии
// - в светлой теме — тёмные частицы и более тёмные линии
const pointColor = isDark
    ? 'rgba(226, 232, 255, 0.9)'   // почти белые точки на тёмном
    : 'rgba(15, 23, 42, 0.9)';     // почти чёрные точки на светлом

const lineBase = isDark
    ? '148, 163, 255'              // светлый синий
    : '30, 41, 59';                // тёмный синевато‑серый

        // Линии между близкими частицами
        ctx.lineWidth = 0.9;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MAX_DISTANCE) {
                    const alpha = (1 - dist / MAX_DISTANCE) * 0.45;
                    ctx.strokeStyle = `rgba(${lineBase}, ${alpha.toFixed(3)})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }

        // Частицы (кружки и квадраты)
        ctx.fillStyle = pointColor;
        for (const p of particles) {
            if (p.type === 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.rect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                ctx.fill();
            }
        }
    }

    function update() {
        const w = canvas.width;
        const h = canvas.height;

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;

            // плавный wrap-around, без отскоков
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
        }
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    createParticles();
    loop();
}

// ===== ПЛАВНЫЕ ПЕРЕХОДЫ МЕЖДУ СТРАНИЦАМИ (чистый fade) =====

window.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    if (body.classList.contains('page-transition')) {
        // чтобы не было короткого "скачка" скролла
        window.scrollTo(0, 0);

        // запустим fade‑in кадром позже, чтобы transition сработал
        requestAnimationFrame(() => {
            body.classList.add('page-transition-visible');
        });

        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            const isExternal =
                href.startsWith('http') ||
                href.startsWith('//') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('#');

            if (isExternal) return;

            link.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

                e.preventDefault();
                const url = href;

                // фиксируем скролл и запускаем fade‑out
                window.scrollTo(0, 0);
                body.classList.add('page-transition-fadeout');
                body.classList.remove('page-transition-visible');

                // ждём окончания transition (0.28s в CSS) и меняем страницу
                setTimeout(() => {
                    window.location.href = url;
                }, 260);
            });
        });
    }
});