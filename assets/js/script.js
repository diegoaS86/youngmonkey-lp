// assets/js/script.js (Orquestrador Principal)

// Importar GSAP e Plugins
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Observer } from "gsap/Observer";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

// Importar funções dos seus módulos
import { initializeLightbox } from './lightbox.js';
import { initializeHeaderAnimation } from './header.js';
import { initializeHeroSection } from './hero.js';
import { initializeSection1 } from './section-1.js';
import { initializeServicesSection } from './services.js';
import { setupLogoMarqueeWithGSAP, setupTestimonialSlider, setupSVGAnimation } from './testimonial.js';
import { initializeFooterSection } from './footer.js';
// svgLoader.js é auto-executável no DOMContentLoaded e importa seu JSON, não precisa importar função dele aqui.
// showcase.js também é auto-executável no 'load' e importa suas dependências, não precisa importar função dele aqui.


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

    // Registrar Plugins GSAP (já importados)
    // O try-catch aqui era para o caso de GSAP não estar carregado via CDN,
    // com imports, o erro de carregamento aconteceria antes.
    gsap.registerPlugin(
        MotionPathPlugin,
        Observer,
        ScrambleTextPlugin,
        ScrollTrigger,
        DrawSVGPlugin,
        ScrollSmoother,
        ScrollToPlugin,
        TextPlugin,
        Draggable,
        InertiaPlugin
    );
    console.log("GSAP Plugins Registrados.");


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

        if (menuNavLinks.length > 0) {
            menuNavLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    const rawHref = this.getAttribute('href');
                    let targetId = rawHref;

                    if (rawHref && rawHref.startsWith('#')) {
                        event.preventDefault();

                        // Mapeamento de IDs (se necessário, como no seu código original)
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
            if (gsap.globalTimeline) { // GSAP já deve estar definido aqui
                gsap.globalTimeline[document.hidden ? 'pause' : 'resume']();
            }
        });
    };

    const contactBtnMobile = document.getElementById('contactBtnMobile');
    const heroSectionForMobileBtn = document.getElementById('section-1'); // Assumindo que é a seção 1 que controla isso

    if (contactBtnMobile && heroSectionForMobileBtn) {
        ScrollTrigger.create({
            trigger: heroSectionForMobileBtn, // Corrigido para usar a variável correta
            start: "top 100%",
            end: "max",
            toggleClass: {
                targets: contactBtnMobile,
                className: "is-visible"
            },
            onEnter: () => {
                console.log('Hero saiu de vista, mostrando botão mobile (ScrollTrigger onEnter)');
            },
            onLeaveBack: () => {
                console.log('Hero voltou à vista, escondendo botão mobile (ScrollTrigger onLeaveBack)');
            }
        });
    } else {
        if (!contactBtnMobile) console.warn("Botão de contato mobile #contactBtnMobile não encontrado para ScrollTrigger.");
        if (!heroSectionForMobileBtn) console.warn("Seção para trigger do botão mobile não encontrada.");
    }

    setupMenu();
    setupMenuHoverEffects();
    setupPerformanceControls();

    initializeLightbox(gsap, smoother);
    initializeHeaderAnimation(gsap, ScrollTrigger, smoother);
    initializeHeroSection(gsap, ScrollTrigger, smoother);
    initializeSection1(gsap, ScrollTrigger);
    initializeServicesSection(gsap, ScrollTrigger);

    if (document.getElementById('section-3')) {
        setupLogoMarqueeWithGSAP(); // Não precisa mais passar gsap, Draggable, InertiaPlugin se importados em testimonial.js
        setupTestimonialSlider();   // Não precisa mais passar gsap se importado em testimonial.js
        setupSVGAnimation();      // Não precisa mais passar gsap, ScrollTrigger se importados em testimonial.js

        ScrollTrigger.normalizeScroll(true);
        ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
    }

    initializeFooterSection(gsap, ScrollTrigger);

    gsap.delayedCall(0.5, () => {
        setViewportHeight();
        ScrollTrigger.refresh();
    });
});

window.addEventListener('load', () => {
    console.log("Window loaded - Main Script");
    setViewportHeight();
    gsap.delayedCall(0.1, () => {
        console.log("Main script: Final refresh on window load.");
        ScrollTrigger.refresh(true);
    });
});
