document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize GSAP & ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    initCursor();
    initMagneticButtons();
    initSmoothScroll();
    initScrollAnimations();

    // Remove loading class
    document.body.classList.remove('loading');

    // ==========================================
    // Custom Cursor Logic
    // ==========================================
    function initCursor() {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorFollower = document.querySelector('.cursor-follower');

        // Check if cursor elements exist
        if (!cursorDot || !cursorFollower) return;

        let mouseX = 0, mouseY = 0;
        let dotX = 0, dotY = 0;
        let followerX = 0, followerY = 0;

        // Follow mouse
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Easing interpolation for smooth following
        gsap.ticker.add(() => {
            dotX += (mouseX - dotX) * 0.5;
            dotY += (mouseY - dotY) * 0.5;

            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;

            gsap.set(cursorDot, { x: dotX, y: dotY });
            gsap.set(cursorFollower, { x: followerX, y: followerY });
        });

        // Hover states on interactive elements
        const interactives = document.querySelectorAll('a, button, .magnetic');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovering');
            });
        });
    }

    // ==========================================
    // Magnetic Button Effect
    // ==========================================
    function initMagneticButtons() {
        const magnets = document.querySelectorAll('.magnetic');

        magnets.forEach(magnet => {
            magnet.addEventListener('mousemove', (e) => {
                const rect = magnet.getBoundingClientRect();
                const strength = magnet.getAttribute('data-strength') || 20;

                // Calculate mouse position relative to center of element (-1 to 1)
                const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

                gsap.to(magnet, {
                    x: x * strength,
                    y: y * strength,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });

            magnet.addEventListener('mouseleave', () => {
                gsap.to(magnet, {
                    x: 0,
                    y: 0,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // ==========================================
    // Smooth Scrolling for Navigation
    // ==========================================
    function initSmoothScroll() {
        const navLinks = document.querySelectorAll('.nav__link, .btn.--cta');

        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');

                // Only act on anchor links pointing to sections on this page
                if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        // Use native smooth scrolling or fallback to GSAP if ScrollToPlugin is added
                        // We use native here for simplicity as it pairs well with our CSS
                        const headerOffset = 100; // Matches var(--header-height)
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                }
            });
        });
    }

    // ==========================================
    // Parallax and Reveal Animations (GSAP)
    // ==========================================
    function initScrollAnimations() {
        const customEase = "power3.out";

        // Hero Sequence (Masked revealing text)
        const heroTl = gsap.timeline({ delay: 0.2 });

        heroTl.from(".hero__subtitle", {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: customEase
        })
            .from(".hero__title-line", {
                yPercent: 120, // animates up from below the mask
                duration: 1.2,
                stagger: 0.15,
                ease: "power4.out"
            }, "-=0.6")
            .from(".hero__description", {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: customEase
            }, "-=0.8")
            .from(".hero__actions", {
                y: 20,
                opacity: 0,
                duration: 1,
                ease: customEase
            }, "-=0.8");

        // Section Titles Mask Reveal
        gsap.utils.toArray('.section-title.reveal-text').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                },
                y: 50,
                opacity: 0,
                duration: 1.2,
                ease: customEase
            });
        });

        // Generic Fades
        gsap.utils.toArray('.reveal-fade').forEach(elem => {
            gsap.from(elem, {
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                },
                y: 30,
                opacity: 0,
                duration: 1,
                ease: customEase
            });
        });

        // Project Rows Scroll Reveal
        gsap.utils.toArray('.project-row').forEach(row => {
            const info = row.querySelector('.project-row__info');
            const img = row.querySelector('.project-row__image-wrap');

            gsap.from(img, {
                scrollTrigger: {
                    trigger: row,
                    start: "top 80%",
                },
                y: 60,
                opacity: 0,
                duration: 1.2,
                ease: customEase
            });

            gsap.from(info, {
                scrollTrigger: {
                    trigger: row,
                    start: "top 75%",
                },
                y: 40,
                opacity: 0,
                duration: 1,
                delay: 0.2,
                ease: customEase
            });
        });

        // Image Parallax Effect
        gsap.utils.toArray('.project-row__image').forEach(img => {
            gsap.to(img, {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    }
});

// ==========================================
// Internationalization (i18n)
// ==========================================
const i18n = {
    en: {
        navAbout: 'About',
        navProj: 'Projects',
        navExp: 'Experience',
        navConn: 'Connect',
        heroSub: 'SOFTWARE ENGINEER <span class="accent">&amp;</span> DATA ENTHUSIAST',
        heroDesc: 'Applying logic and mathematics to solve complex real-world problems. Specializing in <span class="accent">Machine Learning</span>, <span class="accent">Android Architectures</span>, and Embedded Systems.',
        heroBtn: 'Explore Work <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
        projTitle: 'Selected <br /> <span class="accent">Projects</span>',
        projSub: 'A curated selection of academic and personal technical projects tackling predictive models, embedded system control, and AI integration.',
        p1Desc: 'An integrated locker access system using NFC authentication via smart wristbands. Built an intuitive mobile application for secure management.',
        viewRepo1: 'View Repository <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
        p2Desc: 'ML classification models predicting patient survival based on clinical data. Utilized PCA dimensionality reduction and hyperparameter tuning (GridSearchCV) on KNN and MLP architectures.',
        viewRepo2: 'View Repository <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
        p3Desc: 'An Android application that aggregates economic news and utilizes the Gemini LLM API to generate automatic, real-time summaries and insights for users.',
        viewRepo3: 'View Repository <svg width="14" height="14" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line><polyline points=\"12 5 19 12 12 19\"></polyline></svg>',
        eduTitle: 'Academic <br /> <span class=\"accent\">Background</span>',
        edu1Desc: 'Extensive academic training through practical, semester-long integrated projects focusing on full-stack development, ML, and software architecture.',
        edu2Title: 'Technical High School (Informatics)',
        edu2Desc: 'Foundational programming, logic, and systems integration courses.',
        skillTitle: 'Technical <br /> <span class=\"accent\">Arsenal</span>',
        s1Title: 'Core Engineering',
        s2Title: 'Data & Machine Learning',
        s3Title: 'Tools & Platforms',
        footTitle: "Let's build<br /> something <span class=\"accent\">great.</span>",
        footSub: 'Currently open for internships and junior software engineering roles.'
    },
    pt: {
        navAbout: 'Sobre',
        navProj: 'Projetos',
        navExp: 'Experiência',
        navConn: 'Conectar',
        heroSub: 'ENGENHEIRO DE SOFTWARE <span class=\"accent\">&amp;</span> ENTUSIASTA DE DADOS',
        heroDesc: 'Aplicando lógica e matemática para resolver problemas complexos do mundo real. Especializando-se em <span class=\"accent\">Machine Learning</span>, <span class=\"accent\">Arquiteturas Android</span> e Sistemas Embarcados.',
        heroBtn: 'Projetos <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line><polyline points=\"12 5 19 12 12 19\"></polyline></svg>',
        projTitle: 'Projetos <br /> <span class=\"accent\">Selecionados</span>',
        projSub: 'Uma seleção de projetos técnicos focados em inteligência artificial, controle de hardware e aplicativos mobile.',
        p1Desc: 'Um sistema integrado de acesso a armários usando autenticação NFC via pulseiras inteligentes. Construída uma aplicação móvel intuitiva para gestão.',
        viewRepo1: 'Ver Repositório <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line><polyline points=\"12 5 19 12 12 19\"></polyline></svg>',
        p2Desc: 'Modelos de classificação predizendo a sobrevivência de pacientes com dados clínicos. Uso de PCA e GridSearchCV em arquiteturas KNN e MLP.',
        viewRepo2: 'Ver Repositório <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line><polyline points=\"12 5 19 12 12 19\"></polyline></svg>',
        p3Desc: 'Um aplicativo Android que agrega notícias econômicas e utiliza a API LLM do Gemini para gerar resumos em tempo real.',
        viewRepo3: 'Ver Repositório <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line><polyline points=\"12 5 19 12 12 19\"></polyline></svg>',
        eduTitle: 'Formação <br /> <span class=\"accent\">Acadêmica</span>',
        edu1Desc: 'Treinamento prático em desenvolvimento full-stack, ML e arquitetura de software.',
        edu2Title: 'Ensino Médio Técnico (Informática)',
        edu2Desc: 'Fundamentos de programação, lógica de sistemas e montagem.',
        skillTitle: 'Arsenal <br /> <span class=\"accent\">Técnico</span>',
        s1Title: 'Engenharia de Software',
        s2Title: 'Dados & Machine Learning',
        s3Title: 'Ferramentas & Plataformas',
        footTitle: 'Vamos construir <br /> algo <span class=\"accent\">incrível.</span>',
        footSub: 'Buscando oportunidades em engenharia de software e ciência de dados.'
    }
};

let currentLang = 'en';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'pt' : 'en';
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.textContent = currentLang === 'en' ? 'PT' : 'EN';
    }

    const map = {
        navAbout: document.querySelector('a[href="#about"]'),
        navProj: document.querySelector('a[href="#projects"]'),
        navExp: document.querySelector('a[href="#experience"]'),
        navConn: document.querySelector('.btn.\\-\\-cta .btn-text'),
        heroSub: document.querySelector('.hero__subtitle'),
        heroDesc: document.querySelector('.hero__description'),
        heroBtn: document.querySelector('.hero__actions .btn-text'),
        projTitle: document.querySelectorAll('.section-title.reveal-text')[0],
        projSub: document.querySelector('.section-subtitle'),
        p1Desc: document.querySelectorAll('.project-row__desc')[0],
        viewRepo1: document.querySelectorAll('.view-project-link')[0],
        p2Desc: document.querySelectorAll('.project-row__desc')[1],
        viewRepo2: document.querySelectorAll('.view-project-link')[1],
        p3Desc: document.querySelectorAll('.project-row__desc')[2],
        viewRepo3: document.querySelectorAll('.view-project-link')[2],
        eduTitle: document.querySelectorAll('.resume-col .section-title')[0],
        skillTitle: document.querySelectorAll('.resume-col .section-title')[1],
        edu1Desc: document.querySelectorAll('.timeline-desc')[0],
        edu2Title: document.querySelectorAll('.timeline-title')[1],
        edu2Desc: document.querySelectorAll('.timeline-desc')[1],
        s1Title: document.querySelectorAll('.skills-category h4')[0],
        s2Title: document.querySelectorAll('.skills-category h4')[1],
        s3Title: document.querySelectorAll('.skills-category h4')[2],
        footTitle: document.querySelector('.footer__title'),
        footSub: document.querySelector('.footer__contact-info .footer__subtitle')
    };

    const dict = i18n[currentLang];

    for (const key in map) {
        if (map[key] && dict[key]) {
            map[key].innerHTML = dict[key];
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }
});
