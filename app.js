/* ==========================================================================
   Felipe Yabiko Nogueira — portfólio
   Sem framework. GSAP + ScrollTrigger para as animações e Lenis para a
   rolagem suave; sem eles (ou com "reduzir movimento") tudo continua
   visível e funcionando.
   ========================================================================== */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mouseFino = window.matchMedia('(pointer: fine)').matches;
    var temGsap = !!(window.gsap && window.ScrollTrigger) && !reduzido;
    var lenis = null;
    var idioma = root.getAttribute('data-lang') || 'pt';
    var T = function (k) { return (window.I18N[idioma] || {})[k] || window.I18N.pt[k]; };

    if (temGsap) gsap.registerPlugin(ScrollTrigger);

    /* ======================================================================
       Idioma
       ====================================================================== */
    var originais = new Map();
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        originais.set(el, el.innerHTML);
    });

    function aplicarIdioma(lang) {
        idioma = lang;
        root.setAttribute('data-lang', lang);
        root.lang = lang === 'en' ? 'en' : 'pt-BR';
        var en = window.I18N.en;
        originais.forEach(function (html, el) {
            var k = el.getAttribute('data-i18n');
            el.innerHTML = lang === 'en' && en[k] ? en[k] : html;
        });
        var btn = document.getElementById('lang-toggle');
        btn.textContent = T('langBtn');
        btn.setAttribute('aria-label', T('langAria'));
        botaoMenu.setAttribute('aria-label', menu.hidden ? T('menuOpen') : T('menuClose'));
        prepararLinks();
        dividirFrase();
        document.querySelectorAll('.project-video').forEach(function (v) { if (v._botao) atualizarBotao(v); });
        atualizarIndicadores();
        try { localStorage.setItem('lang', lang); } catch (e) { /* modo privado */ }
        if (temGsap) ScrollTrigger.refresh();
    }

    document.getElementById('lang-toggle').addEventListener('click', function () {
        aplicarIdioma(idioma === 'en' ? 'pt' : 'en');
    });

    // Texto duplicado para o efeito de "rolar" dos links
    function prepararLinks() {
        document.querySelectorAll('.link-roll > span').forEach(function (s) {
            s.setAttribute('data-text', s.textContent);
        });
    }

    /* ======================================================================
       Abertura e entrada do hero
       ====================================================================== */
    function abertura(pronto) {
        var loader = document.querySelector('.loader');
        var visto = root.classList.contains('ja-visto');
        try { sessionStorage.setItem('visto', '1'); } catch (e) { }
        if (!loader || visto || reduzido || !temGsap) {
            if (loader) loader.remove();
            pronto();
            return;
        }
        var num = document.getElementById('loader-num');
        var barra = loader.querySelector('.loader__bar span');
        var estado = { v: 0 };
        gsap.timeline()
            .to(estado, {
                v: 100, duration: 1.2, ease: 'power2.inOut',
                onUpdate: function () {
                    num.textContent = String(Math.round(estado.v)).padStart(2, '0');
                    barra.style.width = estado.v + '%';
                }
            })
            .to(loader, { yPercent: -100, duration: 0.9, ease: 'power4.inOut', onStart: pronto }, '+=0.1')
            .add(function () { loader.remove(); });
    }

    function dividirNome() {
        document.querySelectorAll('.hero__name-line').forEach(function (linha) {
            var t = linha.textContent;
            linha.innerHTML = t.split('').map(function (c) {
                return '<span class="char">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
            }).join('');
        });
    }

    function entradaHero() {
        desenharGrafico(true);
        if (!temGsap) return;
        gsap.from('.hero__name .char', { yPercent: 105, duration: 1.2, ease: 'power4.out', stagger: 0.035 });
        gsap.from(['.hero__meta', '.hero__lede', '.hero__live'], { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.25 });
        gsap.from('.header__logo, .header__nav, .header__right', { opacity: 0, duration: 1, delay: 0.4 });
    }

    // O nome ocupa a largura toda: mede e ajusta o tamanho da fonte
    function ajustarNome() {
        var h1 = document.querySelector('.hero__name');
        if (!h1) return;
        var disp = h1.parentElement.clientWidth - parseFloat(getComputedStyle(h1.parentElement).paddingLeft) * 2;
        h1.style.fontSize = '100px';
        h1.style.width = 'max-content';
        var coluna = getComputedStyle(h1).flexDirection === 'column';
        var largura = 0;
        if (coluna) {
            h1.querySelectorAll('.hero__name-line').forEach(function (l) { largura = Math.max(largura, l.scrollWidth); });
        } else {
            largura = h1.scrollWidth;
        }
        h1.style.width = '';
        var tamanho = Math.min(100 * disp / largura * 0.995, window.innerHeight * (coluna ? 0.2 : 0.32));
        h1.style.fontSize = tamanho + 'px';
    }

    /* ======================================================================
       Rolagem suave e âncoras
       ====================================================================== */
    function iniciarRolagem() {
        if (!temGsap || !window.Lenis) return;
        lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = a.getAttribute('href');
            var alvo = id === '#' || id === '#topo' ? document.body : document.querySelector(id);
            if (!alvo) return;
            e.preventDefault();
            fecharMenu();
            var topo = alvo === document.body ? 0 : alvo.getBoundingClientRect().top + window.scrollY - 10;
            if (lenis) lenis.scrollTo(topo, { duration: 1.4 });
            else window.scrollTo({ top: topo, behavior: reduzido ? 'auto' : 'smooth' });
            if (alvo !== document.body) {
                alvo.setAttribute('tabindex', '-1');
                alvo.focus({ preventScroll: true });
            }
        });
    });

    /* ======================================================================
       Cabeçalho: some ao descer, volta ao subir, e troca de cor nas seções
       escuras (marcadas com data-tone="dark")
       ====================================================================== */
    function cabecalho() {
        var header = document.querySelector('.header');
        var escuras = Array.prototype.slice.call(document.querySelectorAll('[data-tone="dark"]'));
        var antes = window.scrollY;
        var pendente = false;
        var atualizar = function () {
            pendente = false;
            var y = window.scrollY;
            if (!document.body.classList.contains('menu-aberto')) {
                header.classList.toggle('is-hidden', y > antes && y > 240);
            }
            antes = y;
            header.classList.toggle('is-scrolled', y > 40);
            var meio = header.offsetHeight / 2;
            header.classList.toggle('is-dark', escuras.some(function (el) {
                var r = el.getBoundingClientRect();
                return r.top <= meio && r.bottom >= meio;
            }));
        };
        window.addEventListener('scroll', function () {
            if (!pendente) { pendente = true; requestAnimationFrame(atualizar); }
        }, { passive: true });
        atualizar();
    }

    /* ======================================================================
       Menu (celular)
       ====================================================================== */
    var menu = document.getElementById('menu');
    var botaoMenu = document.getElementById('menu-toggle');

    function abrirMenu() {
        menu.hidden = false;
        document.body.classList.add('menu-aberto');
        botaoMenu.setAttribute('aria-expanded', 'true');
        botaoMenu.setAttribute('aria-label', T('menuClose'));
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
        if (temGsap) gsap.from('.menu__nav a', { yPercent: 60, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out' });
    }

    function fecharMenu() {
        if (menu.hidden) return;
        menu.hidden = true;
        document.body.classList.remove('menu-aberto');
        botaoMenu.setAttribute('aria-expanded', 'false');
        botaoMenu.setAttribute('aria-label', T('menuOpen'));
        document.body.style.overflow = '';
        if (lenis) lenis.start();
    }

    botaoMenu.addEventListener('click', function () { menu.hidden ? abrirMenu() : fecharMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharMenu(); });

    /* ======================================================================
       Relógio de Campinas
       ====================================================================== */
    function relogio() {
        var el = document.getElementById('clock');
        if (!el) return;
        var f = function () {
            el.textContent = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date());
        };
        f();
        setInterval(f, 20000);
    }

    /* ======================================================================
       Selic desde 2010 — dados do pipeline indicadores-br
       Os valores embutidos são um retrato de 22/10/2026; a página tenta
       buscar os CSVs atualizados no GitHub e, se conseguir, troca por eles.
       ====================================================================== */
    var DADOS = 'https://raw.githubusercontent.com/FelipeYabiko/indicadores-br/main/data/';
    var serie = {
        inicio: [2010, 0],
        valores: [8.75, 8.75, 8.75, 9.5, 9.5, 10.25, 10.75, 10.75, 10.75, 10.75, 10.75, 10.75, 11.25, 11.25, 11.75, 12, 12, 12.25, 12.5, 12.5, 12, 11.5, 11.5, 11, 10.5, 10.5, 9.75, 9, 8.5, 8.5, 8, 7.5, 7.5, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.5, 8, 8, 8.5, 9, 9, 9.5, 10, 10, 10.5, 10.75, 10.75, 11, 11, 11, 11, 11, 11, 11.25, 11.25, 11.75, 12.25, 12.25, 12.75, 13.25, 13.25, 13.75, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14.25, 14, 14, 13.75, 13, 12.25, 12.25, 11.25, 11.25, 10.25, 9.25, 9.25, 8.25, 7.5, 7.5, 7, 7, 6.75, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6, 5.5, 5, 5, 4.5, 4.5, 4.25, 3.75, 3.75, 3, 2.25, 2.25, 2, 2, 2, 2, 2, 2, 2, 2.75, 2.75, 3.5, 4.25, 4.25, 5.25, 6.25, 7.75, 7.75, 9.25, 9.25, 10.75, 11.75, 11.75, 12.75, 13.25, 13.25, 13.75, 13.75, 13.75, 13.75, 13.75, 13.75, 13.75, 13.75, 13.75, 13.75, 13.75, 13.75, 13.25, 12.75, 12.75, 12.25, 11.75, 11.75, 11.25, 10.75, 10.75, 10.5, 10.5, 10.5, 10.5, 10.75, 10.75, 11.25, 12.25, 13.25, 13.25, 14.25, 14.25, 14.75, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14.75, 14.5, 14.5, 14.25, 14.25, 14, 13.75, 13.75]
    };
    var ultimo = { selic: 13.75, ipca12: 4.58, dolar: 5.0277, data: '2026-10-22' };

    var canvas = document.getElementById('selic-chart');
    var ctx = canvas && canvas.getContext('2d');
    var dica = document.getElementById('chart-tip');
    var progresso = 0;        // 0→1 enquanto as colunas aparecem
    var destaque = -1;        // coluna sob o cursor
    var pulso = 0;

    function numero(v, casas) {
        return v.toLocaleString(idioma === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    }

    function atualizarIndicadores() {
        var s = document.getElementById('v-selic');
        if (!s) return;
        s.textContent = numero(ultimo.selic, 2) + '%';
        document.getElementById('v-ipca').textContent = numero(ultimo.ipca12, 2) + '%';
        document.getElementById('v-dolar').textContent = (idioma === 'en' ? 'R$ ' : 'R$ ') + numero(ultimo.dolar, 2);
        var d = ultimo.data.split('-');
        document.getElementById('v-data').textContent = idioma === 'en' ? d[1] + '/' + d[2] + '/' + d[0] : d[2] + '/' + d[1] + '/' + d[0];
    }

    function lerCsv(texto) {
        return texto.trim().split('\n').slice(1).map(function (l) {
            var p = l.split(',');
            return [p[0], parseFloat(p[1])];
        }).filter(function (r) { return !isNaN(r[1]); });
    }

    function buscarDados() {
        if (!window.fetch) return;
        var pegar = function (nome) {
            return fetch(DADOS + nome + '.csv', { cache: 'no-cache' }).then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.text();
            }).then(lerCsv);
        };
        Promise.all([pegar('selic'), pegar('ipca'), pegar('dolar')]).then(function (res) {
            var selic = res[0], ipca = res[1], dolar = res[2];
            if (!selic.length || !ipca.length || !dolar.length) return;
            // Último valor de cada mês
            var meses = {};
            selic.forEach(function (r) { meses[r[0].slice(0, 7)] = r[1]; });
            var chaves = Object.keys(meses).sort();
            var p0 = chaves[0].split('-');
            serie = { inicio: [+p0[0], +p0[1] - 1], valores: chaves.map(function (k) { return meses[k]; }) };
            // IPCA acumulado em 12 meses (juros compostos)
            var acc = ipca.slice(-12).reduce(function (a, r) { return a * (1 + r[1] / 100); }, 1);
            var fim = selic[selic.length - 1];
            ultimo = { selic: fim[1], ipca12: (acc - 1) * 100, dolar: dolar[dolar.length - 1][1], data: fim[0] };
            atualizarIndicadores();
            desenharGrafico(false);
        }).catch(function () { /* fica com o retrato embutido */ });
    }

    function tamanhoCanvas() {
        if (!canvas) return;
        var r = canvas.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(r.width * dpr);
        canvas.height = Math.round(r.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function geometria() {
        var r = canvas.getBoundingClientRect();
        var n = serie.valores.length;
        var base = r.height - 18;                // espaço para os anos
        return { w: r.width, h: r.height, n: n, col: r.width / n, base: base, passo: r.width < 600 ? 4 : 5, max: 22 };
    }

    function pintar() {
        if (!ctx) return;
        var g = geometria();
        ctx.clearRect(0, 0, g.w, g.h);
        var limite = Math.floor(progresso * g.n);
        var raio = g.col < 4 ? 0.9 : 1.15;
        for (var i = 0; i < limite; i++) {
            var v = serie.valores[i];
            var x = i * g.col + g.col / 2;
            var pontos = Math.round((v / g.max) * (g.base / g.passo));
            var ultimoMes = i === g.n - 1;
            ctx.fillStyle = i === destaque ? '#FF4F17' : ultimoMes ? '#0F0F0E' : 'rgba(15,15,14,' + (0.16 + 0.22 * (i / g.n)) + ')';
            for (var k = 0; k < pontos; k++) {
                ctx.beginPath();
                ctx.arc(x, g.base - k * g.passo, raio, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // Anos no eixo
        ctx.fillStyle = 'rgba(87,85,79,1)';
        ctx.font = '10px "Geist Mono", ui-monospace, monospace';
        ctx.textBaseline = 'bottom';
        for (var j = 0; j < g.n; j++) {
            var mes = (serie.inicio[1] + j) % 12;
            var ano = serie.inicio[0] + Math.floor((serie.inicio[1] + j) / 12);
            if (mes === 0 && ano % (g.w < 600 ? 4 : 2) === 0) ctx.fillText(String(ano), j * g.col, g.h);
        }
        // Último ponto: pulsa
        if (limite >= g.n) {
            var vx = (g.n - 1) * g.col + g.col / 2;
            var vy = g.base - Math.round((serie.valores[g.n - 1] / g.max) * (g.base / g.passo)) * g.passo;
            ctx.beginPath();
            ctx.arc(vx, vy, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#FF4F17';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(vx, vy, 4 + pulso * 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,79,23,' + (1 - pulso) + ')';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    var animandoPulso = false;
    var heroVisivel = true;

    function loopPulso() {
        if (!heroVisivel || reduzido) { animandoPulso = false; return; }
        animandoPulso = true;
        pulso = (performance.now() % 1800) / 1800;
        pintar();
        requestAnimationFrame(loopPulso);
    }

    function desenharGrafico(animar) {
        if (!canvas) return;
        tamanhoCanvas();
        if (animar && temGsap) {
            var o = { p: 0 };
            gsap.to(o, {
                p: 1, duration: 1.8, ease: 'power2.inOut', delay: 0.3,
                onUpdate: function () { progresso = o.p; pintar(); },
                onComplete: function () { if (!animandoPulso) loopPulso(); }
            });
        } else {
            progresso = 1;
            pintar();
            if (!animandoPulso && !reduzido) loopPulso();
        }
    }

    function interacaoGrafico() {
        if (!canvas) return;
        var fig = canvas.parentElement;
        var mover = function (cx, cy) {
            var r = canvas.getBoundingClientRect();
            var g = geometria();
            var i = Math.floor((cx - r.left) / g.col);
            if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom || i < 0 || i >= g.n) return sair();
            destaque = i;
            var mes = (serie.inicio[1] + i) % 12;
            var ano = serie.inicio[0] + Math.floor((serie.inicio[1] + i) / 12);
            var v = serie.valores[i];
            dica.textContent = T('months')[mes] + ' ' + ano + ' · Selic ' + numero(v, 2) + '%';
            var topo = g.base - Math.round((v / g.max) * (g.base / g.passo)) * g.passo;
            var fr = fig.getBoundingClientRect();
            dica.style.left = Math.min(Math.max(i * g.col + g.col / 2 + (r.left - fr.left), 80), fr.width - 80) + 'px';
            dica.style.top = (topo + (r.top - fr.top)) + 'px';
            dica.classList.add('is-on');
            if (!animandoPulso) pintar();
        };
        var sair = function () {
            destaque = -1;
            dica.classList.remove('is-on');
            if (!animandoPulso) pintar();
        };
        fig.addEventListener('pointermove', function (e) { mover(e.clientX, e.clientY); });
        fig.addEventListener('pointerleave', sair);

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (es) {
                heroVisivel = es[0].isIntersecting;
                if (heroVisivel && progresso >= 1 && !animandoPulso) loopPulso();
            }).observe(fig);
        }
    }

    /* ======================================================================
       Frase do "Sobre": palavras acendem conforme a rolagem
       ====================================================================== */
    var palavras = [];

    function dividirFrase() {
        var el = document.querySelector('[data-split]');
        if (!el || !temGsap) return;
        // Divide só os nós de texto, preservando tags como <em>
        var andar = function (no) {
            Array.prototype.slice.call(no.childNodes).forEach(function (filho) {
                if (filho.nodeType === 3) {
                    var frag = document.createDocumentFragment();
                    filho.textContent.split(/(\s+)/).forEach(function (pedaco) {
                        if (!pedaco) return;
                        if (/^\s+$/.test(pedaco)) { frag.appendChild(document.createTextNode(pedaco)); return; }
                        var s = document.createElement('span');
                        s.className = 'w';
                        s.textContent = pedaco;
                        frag.appendChild(s);
                    });
                    filho.parentNode.replaceChild(frag, filho);
                } else if (filho.nodeType === 1 && !filho.classList.contains('w')) {
                    andar(filho);
                }
            });
        };
        andar(el);
        palavras = Array.prototype.slice.call(el.querySelectorAll('.w'));
        pintarFrase(fraseProgresso);
    }

    var fraseProgresso = 0;

    function pintarFrase(p) {
        fraseProgresso = p;
        var n = palavras.length;
        palavras.forEach(function (w, i) {
            var o = Math.min(1, Math.max(0, p * (n + 6) - i) / 6);
            w.style.opacity = (0.16 + 0.84 * o).toFixed(3);
        });
    }

    /* ======================================================================
       Animações de rolagem
       ====================================================================== */
    function animacoesRolagem() {
        if (!temGsap) return;

        ScrollTrigger.create({
            trigger: '.about__statement',
            start: 'top 85%',
            end: 'bottom 45%',
            scrub: true,
            onUpdate: function (s) { pintarFrase(s.progress); }
        });

        gsap.utils.toArray('.big-title, .mid-title, .caps__title, .stack__title, .principle, .cap, .tl, .stack__group, .contact__lede').forEach(function (el) {
            gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
        });

        gsap.utils.toArray('.section-label').forEach(function (el) {
            gsap.from(el, { scaleX: 0, transformOrigin: '0 50%', duration: 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 92%' } });
        });

        gsap.utils.toArray('.index li').forEach(function (el, i) {
            gsap.from(el, { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', delay: (i % 4) * 0.05, scrollTrigger: { trigger: el, start: 'top 92%' } });
        });

        // Números que contam
        document.querySelectorAll('[data-count]').forEach(function (el) {
            var fim = +el.getAttribute('data-count');
            var largura = el.textContent.length;
            var o = { v: fim > 1000 ? fim - 40 : 0 };
            gsap.to(o, {
                v: fim, duration: 1.6, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 90%' },
                onUpdate: function () { el.textContent = String(Math.round(o.v)).padStart(largura, '0'); }
            });
        });

        // Contato: o "Vamos conversar" sobe
        gsap.from('.contact__big-line', { yPercent: 60, opacity: 0, duration: 1.2, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: '.contact__big', start: 'top 85%' } });

        // Terminal do copom-mcp: linhas aparecem como se rodassem
        var linhas = gsap.utils.toArray('.term__body .t-in, .term__body .t-line');
        if (linhas.length) {
            gsap.from(linhas, { opacity: 0, x: -8, duration: 0.3, stagger: 0.07, ease: 'none', scrollTrigger: { trigger: '.term', start: 'top 75%' } });
        }

        // Cards empilhados: o de baixo encolhe quando o próximo cobre
        ScrollTrigger.matchMedia({
            '(min-width: 901px)': function () {
                var cards = gsap.utils.toArray('.case');
                cards.forEach(function (card, i) {
                    var prox = cards[i + 1];
                    if (!prox) return;
                    gsap.to(card, {
                        scale: 0.94, ease: 'none',
                        scrollTrigger: { trigger: prox, start: 'top 70%', end: 'top 80px', scrub: true }
                    });
                });
                gsap.utils.toArray('.case__media').forEach(function (m) {
                    gsap.from(m, { y: 80, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'top 80px', scrub: true } });
                });
            }
        });
    }

    /* ======================================================================
       Vídeos dos projetos: carregam perto da tela, pausam fora dela
       ====================================================================== */
    var ICONE_TOCAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
    var ICONE_PAUSAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';

    function carregar(video) {
        if (video._carregado) return;
        video._carregado = true;
        video.querySelectorAll('source[data-src]').forEach(function (s) { s.src = s.getAttribute('data-src'); });
        video.load();
    }

    function atualizarBotao(video) {
        var tocando = !video.paused;
        video._botao.innerHTML = tocando ? ICONE_PAUSAR : ICONE_TOCAR;
        video._botao.setAttribute('aria-label', tocando ? T('videoPause') : T('videoPlay'));
        video._botao.title = tocando ? T('videoPause') : T('videoPlay');
    }

    function videos() {
        var lista = document.querySelectorAll('.project-video');
        lista.forEach(function (video) {
            video._pausadoPeloUsuario = reduzido;
            var botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'video-toggle';
            video.parentNode.appendChild(botao);
            video._botao = botao;
            atualizarBotao(video);
            botao.addEventListener('click', function () {
                carregar(video);
                if (video.paused) {
                    video._pausadoPeloUsuario = false;
                    video.play().catch(function () { });
                } else {
                    video._pausadoPeloUsuario = true;
                    video.pause();
                }
            });
            video.addEventListener('play', function () { atualizarBotao(video); });
            video.addEventListener('pause', function () { atualizarBotao(video); });
        });
        if (!('IntersectionObserver' in window)) return;
        var obs = new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                var v = e.target;
                if (e.isIntersecting) {
                    if (v._pausadoPeloUsuario) return;
                    carregar(v);
                    v.play().catch(function () { });
                } else if (!v.paused) {
                    v.pause();
                }
            });
        }, { rootMargin: '200px 0px', threshold: 0.25 });
        lista.forEach(function (v) { obs.observe(v); });
    }

    /* ======================================================================
       Cursor e prévia da lista "Mais projetos" (só com mouse)
       ====================================================================== */
    function cursorEPrevia() {
        if (!mouseFino) return;
        var cursor = document.querySelector('.cursor');
        var rotulo = cursor.querySelector('.cursor__label');
        var previa = document.querySelector('.preview');
        var img = previa.querySelector('img');
        var mx = -100, my = -100, cx = -100, cy = -100, px = -100, py = -100;

        window.addEventListener('pointermove', function (e) {
            mx = e.clientX; my = e.clientY;
            if (!cursor.classList.contains('is-on')) {
                cursor.classList.add('is-on');
                cx = px = mx; cy = py = my;
            }
        }, { passive: true });
        document.addEventListener('pointerleave', function () { cursor.classList.remove('is-on'); });

        var tick = function () {
            cx += (mx - cx) * 0.25; cy += (my - cy) * 0.25;
            px += (mx - px) * 0.12; py += (my - py) * 0.12;
            cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
            previa.style.left = (px + 24) + 'px';
            previa.style.top = (py - previa.offsetHeight / 2) + 'px';
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        var grande = function (txt) { rotulo.textContent = txt; cursor.classList.add('is-big'); };
        var normal = function () { cursor.classList.remove('is-big'); };

        document.querySelectorAll('a.index__row').forEach(function (row) {
            row.addEventListener('pointerenter', function () {
                grande(T('cursorView'));
                var src = row.getAttribute('data-preview');
                if (src) { img.src = src; previa.classList.add('is-on'); }
            });
            row.addEventListener('pointerleave', function () { normal(); previa.classList.remove('is-on'); });
        });
        document.querySelectorAll('[data-cursor]').forEach(function (el) {
            el.addEventListener('pointerenter', function () { grande(el.getAttribute('data-cursor')); });
            el.addEventListener('pointerleave', normal);
        });
    }

    /* ======================================================================
       Copiar e-mail
       ====================================================================== */
    function copiarEmail() {
        var b = document.getElementById('copy-mail');
        if (!b) return;
        b.addEventListener('click', function () {
            var dicaEl = b.querySelector('.copy-mail__hint');
            var mostrar = function () {
                dicaEl.textContent = T('copied');
                setTimeout(function () { dicaEl.innerHTML = idioma === 'en' ? window.I18N.en.copy : originais.get(dicaEl); }, 2000);
            };
            if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute('data-mail')).then(mostrar, function () { location.href = 'mailto:' + b.getAttribute('data-mail'); });
            else location.href = 'mailto:' + b.getAttribute('data-mail');
        });
    }

    /* ======================================================================
       Início
       ====================================================================== */
    function iniciar() {
        if (idioma !== 'pt') aplicarIdioma(idioma);
        else { prepararLinks(); dividirFrase(); atualizarIndicadores(); }
        dividirNome();
        ajustarNome();
        relogio();
        cabecalho();
        iniciarRolagem();
        interacaoGrafico();
        videos();
        cursorEPrevia();
        copiarEmail();
        animacoesRolagem();
        abertura(entradaHero);
        buscarDados();

        var adiar;
        window.addEventListener('resize', function () {
            clearTimeout(adiar);
            adiar = setTimeout(function () {
                ajustarNome();
                desenharGrafico(false);
                if (temGsap) ScrollTrigger.refresh();
            }, 150);
        });
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                ajustarNome();
                pintar();
                if (temGsap) ScrollTrigger.refresh();
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();
