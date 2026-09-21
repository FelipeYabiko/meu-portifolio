/* ==========================================================================
   Felipe Yabiko Nogueira — portfólio
   ========================================================================== */

(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    var hasGSAP = typeof window.gsap !== 'undefined';

    /* ======================================================================
       Dicionário de tradução
       Chave = valor do atributo data-i18n no HTML.
       Para adicionar texto traduzível: coloque data-i18n="minhaChave" no
       elemento e adicione a chave nos dois dicionários abaixo.
       ====================================================================== */
    var i18n = {
        pt: {
            navServices: 'Serviços',
            navProjects: 'Projetos',
            navExperience: 'Experiência',
            navContact: 'Contato',

            idxServices: 'Serviços',
            idxProjects: 'Trabalho selecionado',
            idxExperience: 'Trajetória',

            statusAvailable: 'Disponível para projetos',
            stat1: 'Produtos no ar',
            stat2: 'Time que liderei',
            stat3: 'Inglês certificado',
            stat4: 'Formatura prevista',

            heroEyebrow: 'ENGENHARIA DE SOFTWARE <span class="accent">·</span> DADOS <span class="accent">·</span> AUTOMAÇÃO',
            heroDesc: 'Transformo planilha e processo manual em sistema que roda sozinho. <span class="accent">Dashboards</span>, <span class="accent">automações</span> e aplicações web — do ETL em Python à interface em Next.js.',
            heroBtnPrimary: 'Ver projetos <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
            heroBtnSecondary: 'Falar comigo',

            servicesTitle: 'O que eu <br /> <span class="accent">construo</span>',
            servicesSub: 'Três frentes que resolvem o mesmo problema: informação espalhada e trabalho repetitivo que consome o tempo de quem deveria estar vendendo.',
            s1Label: 'Dados',
            s1Title: 'Dashboards e indicadores',
            s1Desc: 'Seus dados estão em cinco planilhas e três sistemas que não conversam. Eu junto tudo num pipeline de ETL e entrego um painel que o time abre todo dia — não um relatório que ninguém lê.',
            s1i1: 'Integração de múltiplas fontes',
            s1i2: 'Atualização automática',
            s1i3: 'Exportação para Excel',
            s2Label: 'Automação',
            s2Title: 'Automação de processos',
            s2Desc: 'Aquela rotina de copiar dado de PDF, baixar relatório do portal e colar na planilha. Eu escrevo o robô que faz isso sozinho e devolvo as horas para o time.',
            s2i1: 'Extração de PDF e nota fiscal',
            s2i2: 'Navegação automatizada em portais',
            s2i3: 'Leitura de documento com IA',
            s3Label: 'Produto',
            s3Title: 'Aplicações web sob medida',
            s3Desc: 'Sistema de agendamento, catálogo, área do cliente, painel interno. Feito do zero para o seu processo, não um template genérico adaptado na marra.',
            s3i1: 'Next.js e TypeScript',
            s3i2: 'Login e multi-usuário',
            s3i3: 'Deploy e manutenção',

            projectsTitle: 'Projetos <br /> <span class="accent">selecionados</span>',
            projectsSub: 'Uma seleção do que construí — do levantamento de requisitos ao deploy.',
            p1Desc: 'Site e catálogo das três casas da marca Dep\'s, na Praia dos Namorados. Home com cenas 3D em Three.js, catálogo por casa e sacola que fecha o pedido direto no WhatsApp. Na mesa do restaurante, o cliente lê o QR Code e abre o cardápio; o dono cadastra produto, monta a promoção do dia e gera o QR num painel próprio, com Supabase e políticas de acesso por trás.',
            p1Meta: 'Projeto para cliente · No ar',
            p2Desc: 'Plataforma que conecta óticas a clínicas oftalmológicas parceiras. A ótica cadastra o paciente que chegou sem receita, agenda com a clínica, recebe a receita digital e registra a venda do óculos — com isolamento total de dados entre as duas organizações. Tech lead de um time de 6 pessoas.',
            p2Meta: 'TCC · Tech lead · Time de 6 pessoas · No ar',
            p3Desc: 'Vitrine digital do comércio de bairro. Mercadinho, padaria, açougue e barbearia publicam produto com foto e preço, imprimem o QR Code e colam na porta — quem passa na rua já vê o catálogo no celular e chama no WhatsApp. Sem app para instalar e sem intermediário na conversa.',
            p3Meta: 'Produto próprio · Em desenvolvimento',
            p4Desc: 'Ferramenta de votação e ranking de vídeos com geração automática do vídeo final. O pipeline roda em GitHub Actions, baixa e processa cada clipe e monta a compilação do resultado sem intervenção manual.',
            p4Meta: 'Projeto pessoal · No ar',
            viewRepo: 'Ver repositório <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
            viewLive: 'Ver ao vivo <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
            miniTitle: 'Outros projetos',
            m1Desc: 'Classificação de sobrevivência de pacientes com dados clínicos. PCA para redução de dimensionalidade e GridSearchCV sobre KNN e MLP.',
            m2Desc: 'Sistema de acesso a armários com autenticação NFC via pulseira inteligente, com app de gestão.',
            m3Desc: 'App Android que agrega notícias econômicas e usa a API do Gemini para gerar resumos em tempo real.',

            expTitle: 'Experiência <br /> <span class="accent">e formação</span>',
            exp1Date: 'Mar 2026 — Atual',
            exp1Title: 'Estagiário de Engenharia de Software',
            exp1Desc: 'Desenvolvimento de pipelines de ETL em Python e painéis de indicadores para a área comercial. Automação de rotinas de coleta de dados com Playwright e pandas.',
            edu1Title: 'Bacharelado em Engenharia de Software',
            edu1Desc: 'Formação com projetos integradores semestrais em desenvolvimento full-stack, machine learning e arquitetura de software.',
            edu2Title: 'Técnico em Informática',
            edu2Desc: 'Fundamentos de programação, lógica e integração de sistemas.',
            certDate: 'Certificação',
            certTitle: 'Inglês — Nível B2',

            stackTitle: 'Stack <br /> <span class="accent">técnica</span>',
            k1Title: 'Front-end',
            k2Title: 'Back-end e dados',
            k3Title: 'IA aplicada',
            k4Title: 'Automação e infra',

            footTitle: 'Vamos construir <br /> algo <span class="accent">que funciona.</span>',
            footSub: 'Aberto a projetos freelance e a oportunidades em engenharia de software. Respondo em até um dia útil.',
            ctaMail: 'Me mandar um e-mail'
        },

        en: {
            navServices: 'Services',
            navProjects: 'Projects',
            navExperience: 'Experience',
            navContact: 'Contact',

            idxServices: 'Services',
            idxProjects: 'Selected work',
            idxExperience: 'Background',

            statusAvailable: 'Available for projects',
            stat1: 'Products live',
            stat2: 'Team I led',
            stat3: 'Certified English',
            stat4: 'Expected graduation',

            heroEyebrow: 'SOFTWARE ENGINEERING <span class="accent">·</span> DATA <span class="accent">·</span> AUTOMATION',
            heroDesc: 'I turn spreadsheets and manual processes into systems that run on their own. <span class="accent">Dashboards</span>, <span class="accent">automation</span> and web apps — from the Python ETL to the Next.js interface.',
            heroBtnPrimary: 'View projects <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
            heroBtnSecondary: 'Get in touch',

            servicesTitle: 'What I <br /> <span class="accent">build</span>',
            servicesSub: 'Three areas solving the same problem: scattered information and repetitive work eating the time of people who should be selling.',
            s1Label: 'Data',
            s1Title: 'Dashboards and reporting',
            s1Desc: 'Your data lives in five spreadsheets and three systems that never talk to each other. I pull it together in an ETL pipeline and ship a dashboard the team actually opens every day.',
            s1i1: 'Multi-source integration',
            s1i2: 'Automated refresh',
            s1i3: 'Excel export',
            s2Label: 'Automation',
            s2Title: 'Process automation',
            s2Desc: 'That routine of copying data out of a PDF, downloading a report from a portal and pasting it into a spreadsheet. I write the bot that does it, and give those hours back to the team.',
            s2i1: 'PDF and invoice extraction',
            s2i2: 'Automated portal navigation',
            s2i3: 'AI-powered document reading',
            s3Label: 'Product',
            s3Title: 'Custom web applications',
            s3Desc: 'Scheduling systems, catalogues, customer portals, internal dashboards. Built from scratch around your process, not a generic template forced to fit.',
            s3i1: 'Next.js and TypeScript',
            s3i2: 'Auth and multi-user',
            s3i3: 'Deployment and maintenance',

            projectsTitle: 'Selected <br /> <span class="accent">projects</span>',
            projectsSub: 'A selection of what I have built — from requirements gathering to deployment.',
            p1Desc: 'Website and catalogue for the three venues of the Dep\'s brand in Praia dos Namorados, Brazil. Home page built on Three.js scenes, a catalogue per venue and a basket that closes the order straight through WhatsApp. At the restaurant table the customer scans a QR code to open the menu; the owner adds products, builds the daily special and generates the QR code from an admin panel, backed by Supabase and row-level access policies.',
            p1Meta: 'Client project · Live',
            p2Desc: 'Platform connecting optical stores to partner ophthalmology clinics. The store registers a customer who arrived without a prescription, books the appointment, receives the digital prescription and records the eyewear sale — with full data isolation between the two organisations. Tech lead of a 6-person team.',
            p2Meta: 'Capstone project · Tech lead · Team of 6 · Live',
            p3Desc: 'Digital storefront for neighbourhood businesses. Grocers, bakeries, butchers and barbers publish products with photo and price, print a QR code and stick it on the door — passers-by see the catalogue on their phone and message on WhatsApp. No app to install, no middleman in the conversation.',
            p3Meta: 'Own product · In development',
            p4Desc: 'Video voting and ranking tool with automatic generation of the final video. The pipeline runs on GitHub Actions, downloads and processes each clip, and assembles the result compilation with no manual work.',
            p4Meta: 'Personal project · Live',
            viewRepo: 'View repository <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
            viewLive: 'View live <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
            miniTitle: 'Other projects',
            m1Desc: 'Patient survival classification from clinical data. PCA for dimensionality reduction and GridSearchCV over KNN and MLP architectures.',
            m2Desc: 'Locker access system using NFC authentication via smart wristbands, with a management app.',
            m3Desc: 'Android app that aggregates economic news and uses the Gemini API to generate real-time summaries.',

            expTitle: 'Experience <br /> <span class="accent">and education</span>',
            exp1Date: 'Mar 2026 — Present',
            exp1Title: 'Software Engineering Intern',
            exp1Desc: 'Building Python ETL pipelines and KPI dashboards for the commercial division. Automation of data collection routines with Playwright and pandas.',
            edu1Title: 'B.S. Software Engineering',
            edu1Desc: 'Semester-long integrated projects covering full-stack development, machine learning and software architecture.',
            edu2Title: 'Technical High School (Informatics)',
            edu2Desc: 'Foundations of programming, logic and systems integration.',
            certDate: 'Certification',
            certTitle: 'English — B2 level',

            stackTitle: 'Technical <br /> <span class="accent">stack</span>',
            k1Title: 'Front-end',
            k2Title: 'Back-end and data',
            k3Title: 'Applied AI',
            k4Title: 'Automation and infra',

            footTitle: "Let's build <br /> something <span class=\"accent\">that works.</span>",
            footSub: 'Open to freelance projects and software engineering roles. I reply within one business day.',
            ctaMail: 'Send me an email'
        }
    };

    var currentLang = 'pt';

    function applyLanguage(lang) {
        var dict = i18n[lang];
        if (!dict) return;

        currentLang = lang;

        // Cada elemento busca a própria chave — reordenar ou adicionar
        // seções não quebra mais nada.
        var nodes = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < nodes.length; i++) {
            var key = nodes[i].getAttribute('data-i18n');
            if (dict[key]) nodes[i].innerHTML = dict[key];
        }

        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

        var btn = document.getElementById('lang-toggle');
        if (btn) btn.textContent = lang === 'pt' ? 'EN' : 'PT';

        try { localStorage.setItem('lang', lang); } catch (e) { /* modo privado */ }
    }

    function initLanguage() {
        var saved = null;
        try { saved = localStorage.getItem('lang'); } catch (e) { }

        // Sem preferência salva: se o navegador não for português, abre em inglês.
        if (!saved) {
            var nav = (navigator.language || 'pt').toLowerCase();
            saved = nav.indexOf('pt') === 0 ? 'pt' : 'en';
        }

        applyLanguage(saved);

        var btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                applyLanguage(currentLang === 'pt' ? 'en' : 'pt');
            });
        }
    }

    /* ======================================================================
       Menu mobile
       ====================================================================== */
    function initMobileMenu() {
        var toggle = document.getElementById('menu-toggle');
        var nav = document.getElementById('nav');
        if (!toggle || !nav) return;

        function close() {
            nav.classList.remove('is-open');
            document.body.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
        }

        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            document.body.classList.toggle('nav-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        // Fecha ao clicar num link
        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    }

    /* ======================================================================
       Cursor customizado — só em dispositivos com mouse
       ====================================================================== */
    function initCursor() {
        if (!hasFinePointer || !hasGSAP) return;

        var cursorDot = document.querySelector('.cursor-dot');
        var cursorFollower = document.querySelector('.cursor-follower');
        if (!cursorDot || !cursorFollower) return;

        var mouseX = 0, mouseY = 0, dotX = 0, dotY = 0, followerX = 0, followerY = 0;

        window.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        gsap.ticker.add(function () {
            dotX += (mouseX - dotX) * 0.5;
            dotY += (mouseY - dotY) * 0.5;
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            gsap.set(cursorDot, { x: dotX, y: dotY });
            gsap.set(cursorFollower, { x: followerX, y: followerY });
        });

        var interactives = document.querySelectorAll('a, button, .magnetic');
        interactives.forEach(function (el) {
            el.addEventListener('mouseenter', function () { document.body.classList.add('hovering'); });
            el.addEventListener('mouseleave', function () { document.body.classList.remove('hovering'); });
        });
    }

    /* ======================================================================
       Botões magnéticos
       ====================================================================== */
    function initMagneticButtons() {
        if (!hasFinePointer || !hasGSAP || prefersReducedMotion) return;

        document.querySelectorAll('.magnetic').forEach(function (magnet) {
            magnet.addEventListener('mousemove', function (e) {
                var rect = magnet.getBoundingClientRect();
                var strength = magnet.getAttribute('data-strength') || 20;
                var x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                var y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                gsap.to(magnet, { x: x * strength, y: y * strength, duration: 0.5, ease: 'power2.out' });
            });

            magnet.addEventListener('mouseleave', function () {
                gsap.to(magnet, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
            });
        });
    }

    /* ======================================================================
       Scroll suave
       ====================================================================== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (!targetId || targetId.length < 2) return;

                var target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();
                var headerOffset = 100;
                var offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            });
        });
    }

    /* ======================================================================
       Animações de scroll
       ====================================================================== */
    function initScrollAnimations() {
        if (!hasGSAP || prefersReducedMotion) return;
        if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

        var ease = 'power3.out';

        gsap.timeline({ delay: 0.2 })
            .from('.hero__status', { y: 20, opacity: 0, duration: 0.8, ease: ease })
            .from('.hero__subtitle', { y: 40, opacity: 0, duration: 1, ease: ease }, '-=0.5')
            .from('.hero__title-line', { yPercent: 120, duration: 1.2, stagger: 0.15, ease: 'power4.out' }, '-=0.6')
            .from('.hero__description', { y: 40, opacity: 0, duration: 1, ease: ease }, '-=0.8')
            .from('.hero__actions', { y: 20, opacity: 0, duration: 1, ease: ease }, '-=0.8')
            .from('.hero__stats > div', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: ease }, '-=0.7');

        gsap.utils.toArray('.section-title.reveal-text').forEach(function (title) {
            gsap.from(title, {
                scrollTrigger: { trigger: title, start: 'top 85%' },
                y: 50, opacity: 0, duration: 1.2, ease: ease
            });
        });

        gsap.utils.toArray('.reveal-fade').forEach(function (elem) {
            gsap.from(elem, {
                scrollTrigger: { trigger: elem, start: 'top 85%' },
                y: 30, opacity: 0, duration: 1, ease: ease
            });
        });

        gsap.utils.toArray('.project-row').forEach(function (row) {
            var img = row.querySelector('.project-row__image-wrap');
            if (!img) return;
            gsap.from(img, {
                scrollTrigger: { trigger: row, start: 'top 80%' },
                y: 60, opacity: 0, duration: 1.2, ease: ease
            });
        });
    }

    /* ======================================================================
       Header com fundo ao rolar
       ====================================================================== */
    function initHeaderScroll() {
        var header = document.querySelector('.header');
        if (!header) return;

        function update() {
            header.classList.toggle('is-scrolled', window.scrollY > 40);
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    /* ======================================================================
       Barra de progresso da leitura
       ====================================================================== */
    function initScrollProgress() {
        var bar = document.getElementById('scroll-progress');
        if (!bar) return;

        function update() {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var ratio = max > 0 ? window.scrollY / max : 0;
            bar.style.transform = 'scaleX(' + ratio + ')';
        }
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    /* ======================================================================
       Relógio local — mostra que tem gente do outro lado
       ====================================================================== */
    function initClock() {
        var el = document.getElementById('local-time');
        if (!el) return;

        function tick() {
            // Fixo em São Paulo: o horário é o meu, não o de quem visita.
            var now = new Date().toLocaleTimeString(currentLang === 'pt' ? 'pt-BR' : 'en-GB', {
                timeZone: 'America/Sao_Paulo',
                hour: '2-digit',
                minute: '2-digit'
            });
            el.textContent = now;
        }
        tick();
        setInterval(tick, 30000);
    }

    /* ======================================================================
       Boot
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', function () {
        initLanguage();
        initMobileMenu();
        initCursor();
        initMagneticButtons();
        initSmoothScroll();
        initScrollAnimations();
        initHeaderScroll();
        initScrollProgress();
        initClock();
        document.body.classList.remove('loading');
    });

})();
