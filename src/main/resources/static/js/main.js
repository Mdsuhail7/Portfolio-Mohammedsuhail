// Immediately apply theme (Always default to Light Mode unless explicitly toggled to 'dark')
(function applyImmediateTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (document.body) document.body.classList.add('dark-theme');
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (document.body) document.body.classList.remove('dark-theme');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initOpeningScreen();
    initScrollProgressBar();
    initNavbarScrollSpy();
    initProjectsDeckCarousel();
    initTopographicParallax();
    initIotLiveTelemetry();
    initContactFormHandler();
    initMobileMenuToggle();
    initProjectPictureSlider();
});

/* --------------------------------------------------------------------------
   0.0 Theme Toggle Controller (Light Mode by Default)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const savedTheme = localStorage.getItem('portfolio-theme');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.body.classList.remove('dark-theme');
    }

    toggleBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (currentlyDark) {
                document.documentElement.removeAttribute('data-theme');
                document.body.classList.remove('dark-theme');
                localStorage.setItem('portfolio-theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.body.classList.add('dark-theme');
                localStorage.setItem('portfolio-theme', 'dark');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   0. Opening Animated Screen & Swipe-Up Transition Engine
   -------------------------------------------------------------------------- */
function initOpeningScreen() {
    const openingScreen = document.getElementById('opening-screen');
    if (!openingScreen) return;

    let isSwiped = false;

    // Initialize interactive generative particle & wave canvas
    initOpeningInteractiveCanvas(openingScreen);

    function swipeUp() {
        if (isSwiped) return;
        isSwiped = true;
        openingScreen.classList.add('swiped-up');
        document.body.style.overflow = '';
        setTimeout(() => {
            openingScreen.style.display = 'none';
        }, 1200);
    }

    // Lock body scroll while opening screen is active
    document.body.style.overflow = 'hidden';

    // 1. Click / Touch on Enter Button
    const enterBtn = document.getElementById('btn-enter-portfolio');
    if (enterBtn) {
        enterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            swipeUp();
        });
        enterBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            swipeUp();
        });
    }

    const triggerArea = document.getElementById('opening-bottom-trigger');
    if (triggerArea) {
        triggerArea.addEventListener('click', (e) => {
            e.preventDefault();
            swipeUp();
        });
    }

    // 2. Click anywhere on opening screen
    openingScreen.addEventListener('click', (e) => {
        if (e.target.closest('#btn-enter-portfolio') || e.target.closest('#opening-bottom-trigger')) {
            swipeUp();
        }
    });

    // 3. Wheel / Scroll
    window.addEventListener('wheel', (e) => {
        if (!isSwiped && Math.abs(e.deltaY) > 10) {
            swipeUp();
        }
    }, { passive: true });

    // 4. Touch swipe detection (Touchstart & Touchmove)
    let startY = 0;
    openingScreen.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            startY = e.touches[0].clientY;
        }
    }, { passive: true });

    openingScreen.addEventListener('touchmove', (e) => {
        if (!isSwiped && e.touches && e.touches.length > 0) {
            const currentY = e.touches[0].clientY;
            const diffY = startY - currentY;
            if (diffY > 25) { // Swiped up by 25px
                swipeUp();
            }
        }
    }, { passive: true });

    // 5. Keydown (Space, Enter, ArrowDown, ArrowUp)
    window.addEventListener('keydown', (e) => {
        if (!isSwiped && ['Space', 'Enter', 'ArrowDown', 'ArrowUp', 'PageDown'].includes(e.code)) {
            swipeUp();
        }
    });
}

/* Generative Dynamic Interactive Particle & Wave Background Engine */
function initOpeningInteractiveCanvas(container) {
    const canvas = document.getElementById('opening-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationId = null;

    let mouse = {
        x: width * 0.5,
        y: height * 0.5,
        targetX: width * 0.5,
        targetY: height * 0.5,
        active: false
    };

    function resizeOpeningCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeOpeningCanvas);

    const centerContent = container.querySelector('.opening-center-content');

    window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
        mouse.active = true;

        if (centerContent && !container.classList.contains('swiped-up')) {
            const centerX = width * 0.5;
            const centerY = height * 0.5;
            const tiltX = (centerY - e.clientY) * 0.015;
            const tiltY = (e.clientX - centerX) * 0.015;
            centerContent.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(8px)`;
        }
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
        if (centerContent) {
            centerContent.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        }
    });

    // Particle nodes
    const count = Math.min(Math.floor((width * height) / 12000), 75);
    const particles = [];
    const colors = [
        'rgba(255, 90, 54, 0.65)',
        'rgba(255, 140, 66, 0.55)',
        'rgba(255, 200, 87, 0.58)',
        'rgba(255, 110, 80, 0.45)'
    ];

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 2.5 + 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            baseRadius: Math.random() * 2.2 + 1.5
        });
    }

    let time = 0;

    function render() {
        if (container.classList.contains('swiped-up')) {
            if (animationId) cancelAnimationFrame(animationId);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        // Smooth mouse easing
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        time += 0.015;

        // Draw interactive topographic waves with balanced responsive cursor jiggle physics
        // Wave 1 (Coral Ribbon)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 90, 54, 0.22)';
        ctx.lineWidth = 1.8;
        for (let x = 0; x <= width; x += 6) {
            const baseWaveY = height * 0.55 + Math.sin(x * 0.0035 + time) * 32 + Math.cos(x * 0.0018 + time * 0.8) * 18;
            
            // Responsive proximity jiggle & pluck distortion
            const dx = x - mouse.x;
            const dy = baseWaveY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let waveY = baseWaveY;

            if (dist < 170) {
                const influence = Math.pow(1 - dist / 170, 1.7);
                const jiggle = Math.sin(dist * 0.08 - time * 9) * Math.cos(time * 6) * influence * 24;
                const pushY = (dy / (dist + 1)) * influence * 14;
                waveY += jiggle + pushY;
            }

            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();

        // Wave 2 (Golden Amber Ribbon)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 200, 87, 0.24)';
        ctx.lineWidth = 1.6;
        for (let x = 0; x <= width; x += 6) {
            const baseWaveY = height * 0.48 + Math.cos(x * 0.003 - time * 0.9) * 36 + Math.sin(x * 0.0045 + time) * 15;
            
            const dx = x - mouse.x;
            const dy = baseWaveY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let waveY = baseWaveY;

            if (dist < 170) {
                const influence = Math.pow(1 - dist / 170, 1.7);
                const jiggle = Math.cos(dist * 0.09 - time * 9.5) * Math.sin(time * 6.5) * influence * 20;
                const pushY = (dy / (dist + 1)) * influence * 12;
                waveY += jiggle + pushY;
            }

            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();

        // Wave 3 (Upper Accent Ribbon)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 90, 54, 0.16)';
        ctx.lineWidth = 1.4;
        for (let x = 0; x <= width; x += 6) {
            const baseWaveY = height * 0.32 + Math.sin(x * 0.004 + time * 1.1) * 28 + Math.cos(x * 0.002 - time * 0.6) * 16;
            
            const dx = x - mouse.x;
            const dy = baseWaveY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let waveY = baseWaveY;

            if (dist < 170) {
                const influence = Math.pow(1 - dist / 170, 1.7);
                const jiggle = Math.sin(dist * 0.09 - time * 8.5) * Math.cos(time * 5.5) * influence * 18;
                const pushY = (dy / (dist + 1)) * influence * 10;
                waveY += jiggle + pushY;
            }

            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Bounce on edges
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Mouse proximity interaction
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 180) {
                const force = (180 - dist) / 180;
                p.x -= (dx / dist) * force * 2.2;
                p.y -= (dy / dist) * force * 2.2;
                p.radius = p.baseRadius + force * 3.2;
            } else {
                p.radius = p.baseRadius;
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = 'rgba(255, 90, 54, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Connect nearby nodes
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dxx = p.x - p2.x;
                const dyy = p.y - p2.y;
                const d = Math.sqrt(dxx * dxx + dyy * dyy);

                if (d < 140) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(255, 90, 54, ${(1 - d / 140) * 0.22})`;
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(render);
    }

    render();
}

/* --------------------------------------------------------------------------
   1. Scroll Progress Bar
   -------------------------------------------------------------------------- */
function initScrollProgressBar() {
    const scrollBar = document.getElementById('scroll-progress');
    if (!scrollBar) return;

    window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total > 0) {
            const percent = (window.scrollY / total) * 100;
            scrollBar.style.width = `${percent}%`;
        }
    });
}

/* --------------------------------------------------------------------------
   2. Navbar Active Section Scroll Spy
   -------------------------------------------------------------------------- */
function initNavbarScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPos = window.pageYOffset;

        sections.forEach((section) => {
            const top = section.offsetTop - 160;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach((item) => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   3. Recent Projects 3D Card Deck Carousel (Prev / Next Controls)
   -------------------------------------------------------------------------- */
function initProjectsDeckCarousel() {
    const cards = document.querySelectorAll('.project-deck-card');
    const prevBtn = document.getElementById('deck-prev-btn');
    const nextBtn = document.getElementById('deck-next-btn');

    if (!cards.length || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    const totalCards = cards.length;

    function updateDeck(index) {
        cards.forEach((card, idx) => {
            card.classList.remove('active', 'prev', 'next');
            if (idx === index) {
                card.classList.add('active');
            } else if (idx === (index - 1 + totalCards) % totalCards) {
                card.classList.add('prev');
            } else {
                card.classList.add('next');
            }
        });

        prevBtn.classList.toggle('active', index > 0);
        nextBtn.classList.toggle('active', index < totalCards - 1);
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateDeck(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalCards;
        updateDeck(currentIndex);
    });

    // Auto rotate every 6 seconds if idle
    setInterval(() => {
        if (!document.hidden) {
            currentIndex = (currentIndex + 1) % totalCards;
            updateDeck(currentIndex);
        }
    }, 6000);
}

/* --------------------------------------------------------------------------
   4. Global Generative Geometric Dotted Network & Fluid Wave Background Engine
   -------------------------------------------------------------------------- */
function initTopographicParallax() {
    const canvas = document.getElementById('topo-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    });

    let mouse = {
        x: width * 0.5,
        y: height * 0.5,
        targetX: width * 0.5,
        targetY: height * 0.5,
        active: false
    };

    document.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
        mouse.active = true;
    });

    document.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
            mouse.targetX = e.touches[0].clientX;
            mouse.targetY = e.touches[0].clientY;
            mouse.active = true;
        }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    let particles = [];
    const colors = [
        'rgba(255, 90, 54, 0.55)',   // Coral
        'rgba(255, 140, 66, 0.45)',  // Warm Amber
        'rgba(255, 200, 87, 0.48)',  // Golden Yellow
        'rgba(255, 110, 80, 0.38)'   // Peach Coral
    ];

    function initParticles() {
        particles = [];
        const count = Math.min(Math.floor((width * height) / 14000), 85);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.65,
                vy: (Math.random() - 0.5) * 0.65,
                baseRadius: Math.random() * 2.2 + 1.2,
                radius: Math.random() * 2.2 + 1.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }

    initParticles();

    let time = 0;

    function renderGlobalCanvas() {
        time += 0.014;

        // Smooth mouse lerp
        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        ctx.clearRect(0, 0, width, height);

        // 1. Draw continuous harmonic topographic wave ribbons with balanced responsive cursor jiggle physics
        // Wave A (Coral)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 90, 54, 0.18)';
        ctx.lineWidth = 1.6;
        for (let x = 0; x <= width; x += 6) {
            const baseWaveY = height * 0.32 + Math.sin(x * 0.0035 + time) * 32 + Math.cos(x * 0.0018 + time * 0.7) * 18;
            const dx = x - mouse.x;
            const dy = baseWaveY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let waveY = baseWaveY;

            if (dist < 170) {
                const influence = Math.pow(1 - dist / 170, 1.7);
                const jiggle = Math.sin(dist * 0.08 - time * 9) * Math.cos(time * 6) * influence * 22;
                const pushY = (dy / (dist + 1)) * influence * 12;
                waveY += jiggle + pushY;
            }

            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();

        // Wave B (Golden Amber)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 200, 87, 0.2)';
        ctx.lineWidth = 1.5;
        for (let x = 0; x <= width; x += 6) {
            const baseWaveY = height * 0.68 + Math.cos(x * 0.0028 - time * 0.8) * 38 + Math.sin(x * 0.0042 + time) * 16;
            const dx = x - mouse.x;
            const dy = baseWaveY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let waveY = baseWaveY;

            if (dist < 170) {
                const influence = Math.pow(1 - dist / 170, 1.7);
                const jiggle = Math.cos(dist * 0.09 - time * 9.5) * Math.sin(time * 6.5) * influence * 18;
                const pushY = (dy / (dist + 1)) * influence * 10;
                waveY += jiggle + pushY;
            }

            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();

        // 2. Update and draw geometric dotted nodes & dynamic connecting lines
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Screen boundary rebound
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Cursor proximity interaction
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 160) {
                const force = (160 - dist) / 160;
                p.x -= (dx / dist) * force * 1.6;
                p.y -= (dy / dist) * force * 1.6;
                p.radius = p.baseRadius + force * 2.8;
            } else {
                p.radius = p.baseRadius + Math.sin(time * 2 + p.pulsePhase) * 0.4;
            }

            // Draw glowing dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = 'rgba(255, 90, 54, 0.45)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw geometric connection lines to nearest neighbors
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dxx = p.x - p2.x;
                const dyy = p.y - p2.y;
                const d = Math.sqrt(dxx * dxx + dyy * dyy);

                if (d < 125) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(255, 90, 54, ${(1 - d / 125) * 0.16})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(renderGlobalCanvas);
    }

    requestAnimationFrame(renderGlobalCanvas);
}

/* --------------------------------------------------------------------------
   5. Live Simulated IoT Grid Telemetry (Real-time Feedback)
   -------------------------------------------------------------------------- */
function initIotLiveTelemetry() {
    const statusVal = document.getElementById('deck-iot-status');
    const currentVal = document.getElementById('deck-iot-current');

    if (!statusVal || !currentVal) return;

    let cycle = 0;

    setInterval(() => {
        cycle++;
        if (cycle % 5 === 0) {
            statusVal.textContent = 'FAULT ALERT';
            statusVal.style.color = '#EF4444';
            currentVal.textContent = '4.35 A (Spike)';
        } else {
            statusVal.textContent = 'LIVE / OK';
            statusVal.style.color = '#00DF81';
            currentVal.textContent = (1.20 + (Math.random() * 0.12)).toFixed(2) + ' A';
        }
    }, 2400);
}

/* --------------------------------------------------------------------------
   6. Contact Form Handler (Direct Redirect to Mail Client)
   -------------------------------------------------------------------------- */
function initContactFormHandler() {
    const form = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status-message');
    const submitBtn = document.getElementById('btn-contact-submit');

    if (!form || !statusMsg) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Reset error messages
        statusMsg.style.display = 'none';
        statusMsg.className = 'form-status';
        document.querySelectorAll('.err-msg').forEach(err => {
            err.textContent = '';
            err.classList.remove('active');
        });

        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        let hasError = false;

        if (!name) {
            showError('err-name', 'Please enter your name.');
            hasError = true;
        }

        if (!email) {
            showError('err-email', 'Please enter your email.');
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('err-email', 'Please enter a valid email address.');
            hasError = true;
        }

        if (!message) {
            showError('err-message', 'Please enter a message.');
            hasError = true;
        }

        if (hasError) return;

        // Build mailto URL prefilled with sender info and message
        const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
        const body = encodeURIComponent(`Hi Suhail,\n\n${message}\n\n---\nSender Name: ${name}\nSender Email: ${email}`);
        const mailtoUrl = `mailto:suhiisageni@gmail.com?subject=${subject}&body=${body}`;

        statusMsg.textContent = 'Opening your email client...';
        statusMsg.className = 'form-status success';
        statusMsg.style.display = 'block';

        // Redirect directly to default mail client
        window.location.href = mailtoUrl;
    });

    function showError(id, msg) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = msg;
            el.classList.add('active');
        }
    }
}

/* --------------------------------------------------------------------------
   7. Mobile Navigation Toggle
   -------------------------------------------------------------------------- */
function initMobileMenuToggle() {
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

/* --------------------------------------------------------------------------
   8. Project Picture Slider (Automatic & Interactive Picture Slider)
   -------------------------------------------------------------------------- */
function initProjectPictureSlider() {
    const sliders = document.querySelectorAll('.project-slider-wrapper');
    if (!sliders.length) return;

    sliders.forEach((slider) => {
        const slides = slider.querySelectorAll('.project-slide');
        const dots = slider.querySelectorAll('.slide-dot');
        const prevBtn = slider.querySelector('.slide-prev-btn');
        const nextBtn = slider.querySelector('.slide-next-btn');

        if (!slides.length) return;

        let currentIndex = 0;
        let autoSlideInterval = null;

        function goToSlide(index) {
            slides.forEach((slide, idx) => {
                const isActive = idx === index;
                slide.classList.toggle('active', isActive);
                // Pause video on inactive slides
                const vid = slide.querySelector('video');
                if (vid && !isActive) {
                    vid.pause();
                }
            });
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === index);
            });
            currentIndex = index;
        }

        function nextSlide() {
            const nextIndex = (currentIndex + 1) % slides.length;
            goToSlide(nextIndex);
        }

        function prevSlide() {
            const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
            goToSlide(prevIndex);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                nextSlide();
                resetAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                prevSlide();
                resetAutoSlide();
            });
        }

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(idx);
                resetAutoSlide();
            });
        });

        // Pause auto-slide while video is playing
        const slideVideos = slider.querySelectorAll('video');
        slideVideos.forEach((vid) => {
            vid.addEventListener('play', () => stopAutoSlide());
            vid.addEventListener('pause', () => startAutoSlide());
            vid.addEventListener('ended', () => {
                startAutoSlide();
                nextSlide();
            });
            vid.addEventListener('click', (e) => e.stopPropagation());
        });

        function startAutoSlide() {
            const hasPlayingVideo = Array.from(slideVideos).some(v => !v.paused);
            if (!autoSlideInterval && !hasPlayingVideo) {
                autoSlideInterval = setInterval(nextSlide, 4500);
            }
        }

        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        }

        function resetAutoSlide() {
            stopAutoSlide();
            startAutoSlide();
        }

        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);

        startAutoSlide();
    });
}
