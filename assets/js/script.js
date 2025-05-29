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
    setViewportHeight(); 

    const hamburger = document.getElementById('hamburger');
    const navBox = document.getElementById('navBox');
    const menu = document.getElementById('menu');
    const menuLinks = document.querySelectorAll('.menu-nav a, .menu-social a, .menu-lang a');
    const menuNavLinks = document.querySelectorAll('.menu .menu-nav a'); 

    let smoother;

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
            ); 
            console.log("GSAP Plugins Registrados.");
        }
    } catch (error) {
        console.error("Erro ao registrar plugins GSAP:", error);
    }

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
                }); 
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
        }); 

        if (menuNavLinks.length > 0 && typeof gsap !== 'undefined') {
            menuNavLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    const rawHref = this.getAttribute('href'); 
                    let targetId = rawHref;

                    if (rawHref && rawHref.startsWith('#')) {
                        event.preventDefault(); 

                        if (rawHref === "#servicos") { 
                            targetId = "#section-2"; 
                        } else if (rawHref === "#depoimentos") { 
                            targetId = "#section-3"; 
                        } else if (rawHref === "#showcase") { 
                            targetId = "#section-4"; 
                        } else if (rawHref === "#contato") { 
                            targetId = "#footer"; 
                        }
                        
                        if (smoother) {
                            smoother.scrollTo(targetId, true, "top"); 
                        } else {
                            const targetElement = document.querySelector(targetId);
                            if (targetElement) {
                                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } else {
                                console.warn(`Elemento alvo ${targetId} (mapeado de ${rawHref}) não encontrado para o link do menu.`);
                            }
                        }

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
    }; 

    const setupPerformanceControls = () => {
        document.addEventListener('visibilitychange', () => {
            if (typeof gsap !== 'undefined' && gsap.globalTimeline) {
                gsap.globalTimeline[document.hidden ? 'pause' : 'resume']();
            }
        });
    }; 

    // --- INÍCIO: LÓGICA PARA O BOTÃO DE CONTATO MOBILE ---
    const contactBtnMobile = document.getElementById('contactBtnMobile');
    const heroSection = document.getElementById('section-1');

    if (contactBtnMobile && heroSection && typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
        ScrollTrigger.create({
            trigger: heroSection,
            start: "top 100%", // Quando o final da seção hero atinge o topo da viewport
            end: "max", 
            toggleClass: {
                targets: contactBtnMobile,
                className: "is-visible" // Adiciona/remove a classe definida no CSS
            },
            // markers: true, // Descomente esta linha para depuração visual do ScrollTrigger
            onEnter: () => { 
                console.log('Hero saiu de vista, mostrando botão mobile (ScrollTrigger onEnter)');
            },
            onLeaveBack: () => { 
                console.log('Hero voltou à vista, escondendo botão mobile (ScrollTrigger onLeaveBack)');
            }
        });
    } else {
        if (!contactBtnMobile) console.warn("Botão de contato mobile #contactBtnMobile não encontrado para ScrollTrigger.");
        if (!heroSection) console.warn("Seção Hero #hero não encontrada para ScrollTrigger do botão mobile.");
    }
    // --- FIM: LÓGICA PARA O BOTÃO DE CONTATO MOBILE ---

    setupMenu(); 
    setupMenuHoverEffects(); 
    setupPerformanceControls(); 

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
}); 

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
