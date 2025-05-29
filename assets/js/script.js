// assets/js/script.js (Main Orchestrator)

// -----------------------------------------------------------------------------
// 1. Funções e Listeners Globais (Core Utilities)
// -----------------------------------------------------------------------------

function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
        ScrollTrigger.refresh();
    }
}

setViewportHeight(); // Initial call

window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

// -----------------------------------------------------------------------------
// 2. Lógica Principal no DOMContentLoaded
// -----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded - Main Script");
    setViewportHeight(); // Call again after DOM is ready

    // -------------------------------------------------------------------------
    // 2.1. Seletores de Elementos DOM Globais (Menu)
    // -------------------------------------------------------------------------
    const hamburger = document.getElementById('hamburger'); //
    const navBox = document.getElementById('navBox'); //
    const menu = document.getElementById('menu'); //
    const menuLinks = document.querySelectorAll('.menu-nav a, .menu-social a, .menu-lang a'); //
    const menuNavLinks = document.querySelectorAll('.menu .menu-nav a'); // Seleciona apenas os links de navegação do menu principal

    // -------------------------------------------------------------------------
    // 2.2. Variável de Escopo para ScrollSmoother
    // -------------------------------------------------------------------------
    let smoother; //

    // -------------------------------------------------------------------------
    // 2.3. Registro de Plugins GSAP (apenas uma vez)
    // -------------------------------------------------------------------------
    try {
        if (typeof gsap === 'undefined') {
            console.error("GSAP não carregado. Algumas animações podem não funcionar.");
        } else {
            gsap.registerPlugin(
                MotionPathPlugin,
                Observer,
                ScrambleTextPlugin,
                ScrollTrigger,
                DrawSVGPlugin,
                ScrollSmoother,
                ScrollToPlugin,
                TextPlugin,
                InertiaPlugin
            ); //
            console.log("GSAP Plugins Registrados.");
        }
    } catch (error) {
        console.error("Erro ao registrar plugins GSAP:", error);
    }

    // -------------------------------------------------------------------------
    // 2.4. Inicialização do ScrollSmoother
    // -------------------------------------------------------------------------
    if (typeof ScrollSmoother !== 'undefined' && typeof gsap !== 'undefined') {
        try {
            if (document.getElementById('smooth-wrapper') && document.getElementById('smooth-content')) {
                smoother = ScrollSmoother.create({
                    wrapper: "#smooth-wrapper",
                    content: "#smooth-content",
                    smooth: 1.2,
                    effects: true,
                    smoothTouch: 0.1,
                    invalidateOnRefresh: true,
                }); //
                console.log("ScrollSmoother created.");
            } else {
                console.warn("ScrollSmoother: Wrapper ou content não encontrado.");
            }
        } catch (e) {
            console.error("Erro ao criar ScrollSmoother:", e);
        }
    } else {
        console.warn("ScrollSmoother ou GSAP não definido. Scroll suave não será ativado.");
    }

    // -------------------------------------------------------------------------
    // 2.5. Definições de Funções de Setup Globais (Menu, Performance)
    // -------------------------------------------------------------------------

    const setupMenu = () => {
        if (!hamburger || !navBox || !menu) {
            console.warn("Menu: Elementos não encontrados.");
            return;
        }
        hamburger.addEventListener('click', () => {
            navBox.classList.toggle('expanded');
            gsap.to(menu, {
                opacity: navBox.classList.contains('expanded') ? 1 : 0,
                visibility: navBox.classList.contains('expanded') ? 'visible' : 'hidden',
                duration: 0.3,
                ease: "power2.inOut"
            });
        }); //

        // ** ADICIONADO: Lógica para rolagem suave dos links de navegação do menu **
        if (menuNavLinks.length > 0 && typeof gsap !== 'undefined') {
            menuNavLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    const rawHref = this.getAttribute('href'); // Ex: "#servicos", "#contato"
                    let targetId = rawHref;

                    if (rawHref && rawHref.startsWith('#')) {
                        event.preventDefault(); // Previne o comportamento padrão de pular

                        // Mapeia os hrefs do menu para os IDs corretos das seções
                        // (conforme os IDs no seu index.html)
                        if (rawHref === "#servicos") { // Link original do menu
                            targetId = "#section-2"; // ID real da seção de serviços
                        } else if (rawHref === "#depoimentos") { // Link original do menu
                            targetId = "#section-3"; // ID real da seção de depoimentos
                        } else if (rawHref === "#showcase") { // Link original do menu
                            targetId = "#section-4"; // ID real da seção de showcase
                        } else if (rawHref === "#contato") { // Link original do menu
                            targetId = "#footer"; // ID real da seção do rodapé
                        }
                        // Se o href já for o ID correto (ex: href="#section-2"), o mapeamento não altera.

                        if (smoother) {
                            smoother.scrollTo(targetId, true, "top"); // Rola para o topo do alvo
                        } else {
                            // Fallback se o smoother não estiver disponível
                            const targetElement = document.querySelector(targetId);
                            if (targetElement) {
                                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } else {
                                console.warn(`Elemento alvo ${targetId} (mapeado de ${rawHref}) não encontrado para o link do menu.`);
                            }
                        }

                        // Fecha o menu se estiver expandido
                        if (navBox && menu && navBox.classList.contains('expanded')) {
                            navBox.classList.remove('expanded');
                            gsap.to(menu, {
                                opacity: 0,
                                visibility: 'hidden',
                                duration: 0.3,
                                ease: "power2.inOut"
                            });
                        }
                    }
                });
            });
        }
        // ** FIM DA ADIÇÃO **
    };

    const setupMenuHoverEffects = () => {
        if (!menuLinks.length) return;
        menuLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(link, { x: 5, color: 'var(--accent-color)', duration: 0.3 });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(link, { x: 0, color: 'var(--light-color)', duration: 0.3 });
            });
        });
    }; //

    const setupPerformanceControls = () => {
        document.addEventListener('visibilitychange', () => {
            if (typeof gsap !== 'undefined' && gsap.globalTimeline) {
                gsap.globalTimeline[document.hidden ? 'pause' : 'resume']();
            }
        });
    }; //

    // -------------------------------------------------------------------------
    // 2.6. Chamadas de Inicialização das Funções de Setup
    // -------------------------------------------------------------------------
    setupMenu(); // Agora inclui a lógica para os links de âncora do menu
    setupMenuHoverEffects(); //
    setupPerformanceControls(); //

    // Inicialização dos módulos (GSAP e ScrollTrigger são passados como dependências)
    if (typeof initializeLightbox === 'function') {
        initializeLightbox(gsap, smoother);
    } else { console.warn("initializeLightbox não definida. Verifique se lightbox.js está carregado antes de script.js"); }

    if (typeof initializeHeaderAnimation === 'function') {
        initializeHeaderAnimation(gsap, ScrollTrigger, smoother);
    } else { console.warn("initializeHeaderAnimation não definida."); }

    if (typeof initializeHeroSection === 'function') {
        initializeHeroSection(gsap, ScrollTrigger, smoother);
    } else { console.warn("initializeHeroSection não definida."); }

    if (typeof initializeSection1 === 'function') {
        initializeSection1(gsap, ScrollTrigger);
    } else { console.warn("initializeSection1 não definida."); }

    if (typeof initializeServicesSection === 'function') {
        initializeServicesSection(gsap, ScrollTrigger);
    } else { console.warn("initializeServicesSection não definida."); }

    if (document.getElementById('section-3')) {
        if (typeof setupLogoMarqueeWithGSAP === 'function') setupLogoMarqueeWithGSAP(); else console.warn("setupLogoMarqueeWithGSAP não definida.");
        if (typeof setupTestimonialSlider === 'function') setupTestimonialSlider(); else console.warn("setupTestimonialSlider não definida.");
        if (typeof setupSVGAnimation === 'function') setupSVGAnimation(); else console.warn("setupSVGAnimation não definida.");

        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.normalizeScroll(true);
            ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
        }
    }

    if (typeof initializeFooterSection === 'function') {
        initializeFooterSection(gsap, ScrollTrigger);
    } else { console.warn("initializeFooterSection não definida."); }


    if (typeof gsap !== 'undefined') {
        gsap.delayedCall(0.5, () => {
            setViewportHeight();
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        });
    }
}); // Fim do DOMContentLoaded

// -----------------------------------------------------------------------------
// 3. Listener Global 'load'
// -----------------------------------------------------------------------------
window.addEventListener('load', () => {
    console.log("Window loaded - Main Script");
    setViewportHeight();
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.delayedCall(0.1, () => {
            console.log("Main script: Final refresh on window load.");
            ScrollTrigger.refresh(true);
        });
    }
});