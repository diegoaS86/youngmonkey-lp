// assets/js/footer.js

/**
 * Returns the default configuration for motionPath animations.
 * @param {HTMLElement} pathElement - The element representing the SVG path.
 * @returns {object} Configurações do motionPath.
 */
const getMotionPathConfig = (pathElement) => ({
    path: pathElement,
    align: pathElement,
    alignOrigin: [0.5, 0.5],
    autoRotate: -90, // Ajuste conforme necessário para a orientação da seta
    start: 0,
    end: 1
});

/**
 * Returns the default tween options.
 * @returns {object} Opções padrão para animações.
 */
const getDefaultTweenOptions = () => ({
    ease: "none"
});

/**
 * Initializes all animations and setups for the Footer section.
 * @param {object} gsapInstance - The GSAP instance.
 * @param {object} ScrollTriggerInstance - The ScrollTrigger instance.
 */
export function initializeFooterSection(gsapInstance, ScrollTriggerInstance) {
    // Helper para seleção dos elementos
    const getFooterElements = () => ({
        arrow: document.querySelector('.footer-arrow'),
        path: document.getElementById('footer-path'),
        draw: document.querySelector('.footer-draw'),
        arrowPoint: document.getElementById('footer-arrow-point'),
        footer: document.getElementById('footer') // Elemento trigger
    });
    
    const { arrow, path, draw, arrowPoint, footer } = getFooterElements();

    // Verifica se todos os elementos necessários existem
    if (!arrow || !path || !draw || !arrowPoint || !footer) {
        console.warn("Footer Arrow: Elements or trigger not found.");
        return;
    }

    // Configura estados iniciais usando helper
    const setInitialStates = () => {
        gsapInstance.set(arrowPoint, { opacity: 0, transformOrigin: "50% 50%" });
        gsapInstance.set(draw, { drawSVG: "0%" });
    };

    // Configura o timeline de animação da seta do footer
    const createArrowTimeline = () => {
        const timeline = gsapInstance.timeline();
        timeline
            .to(arrowPoint, { opacity: 1, duration: 0.01, scale: 0.8, ...getDefaultTweenOptions() }, 0)
            .to(arrowPoint, {
                motionPath: getMotionPathConfig(path),
                ...getDefaultTweenOptions()
            }, 0)
            .to(draw, { drawSVG: "100%", ...getDefaultTweenOptions() }, 0);
        return timeline;
    };

    const setScrollAnimation = (timeline) => {
        ScrollTriggerInstance.create({
            trigger: footer,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1.5,
            animation: timeline,
            // markers: true // Descomente para debug
        });
    };

    // Inicializa a animação do footer
    setInitialStates();
    const arrowTimeline = createArrowTimeline();
    setScrollAnimation(arrowTimeline);

    console.log("Footer Section Initialized");
}